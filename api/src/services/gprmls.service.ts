import { cache, CacheKeys } from './cache.service.js';
import { mockProperties } from '../data/mock-properties.js';
import type {
  Property,
  PropertySearchFilters,
  AgentProfile,
  ResoProperty,
  ResoTokenResponse,
  ResoODataResponse,
} from '../types/property.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const config = {
  tokenUrl: process.env['GPRMLS_TOKEN_URL'] ?? '',
  baseUrl: process.env['GPRMLS_BASE_URL'] ?? '',
  clientId: process.env['GPRMLS_CLIENT_ID'] ?? '',
  clientSecret: process.env['GPRMLS_CLIENT_SECRET'] ?? '',
  agentMlsId: process.env['AGENT_MLS_ID'] ?? 'NE-45821',
  listingCacheTtl: Number(process.env['LISTING_CACHE_TTL'] ?? 300),
};

const isConfigured = () =>
  Boolean(config.tokenUrl && config.baseUrl && config.clientId && config.clientSecret);

// ─── Agent profile (injected onto every mapped property) ──────────────────────

const agentProfile: AgentProfile = {
  name: 'Aaron Krier',
  phone: '(402) 555-0187',
  email: 'aaron@krierrealty.com',
  photo: '/aaron.png',
  bio: "Aaron Krier grew up in Storm Lake, Iowa. Now based in Carter Lake, he's dual-licensed in Nebraska and Iowa and uniquely positioned to guide buyers and sellers on both sides of the Missouri River.",
  title: 'REALTOR® | Licensed in Nebraska & Iowa',
  licenseNumber: 'NE-45821',
  stateLicenses: [
    { state: 'NE', number: 'NE-45821' },
    { state: 'IA', number: 'IA-78234' },
  ],
};

// ─── OAuth token management ───────────────────────────────────────────────────

async function fetchToken(): Promise<string> {
  // 1. Check cache first
  const cached = await cache.get<string>(CacheKeys.mlsToken);
  if (cached) return cached;

  // 2. Exchange client credentials
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'api',
  });

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GPRMLS token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as ResoTokenResponse;

  // Cache for slightly less than the actual TTL to avoid edge-case expiry
  const ttl = Math.max(data.expires_in - 60, 60);
  await cache.set(CacheKeys.mlsToken, data.access_token, ttl);

  return data.access_token;
}

// ─── RESO Web API fetch helper ────────────────────────────────────────────────

async function resoFetch<T>(path: string): Promise<T> {
  const token = await fetchToken();
  const url = `${config.baseUrl}/${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    // Token may have expired — bust the cache and retry once
    await cache.del(CacheKeys.mlsToken);
    const freshToken = await fetchToken();
    const retry = await fetch(url, {
      headers: { Authorization: `Bearer ${freshToken}`, Accept: 'application/json' },
    });
    if (!retry.ok) throw new Error(`RESO API error on retry (${retry.status})`);
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RESO API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── RESO → Property field mapping ───────────────────────────────────────────

const STATUS_MAP: Record<string, Property['status']> = {
  Active: 'active',
  ActiveUnderContract: 'pending',
  Pending: 'pending',
  Closed: 'sold',
};

function buildFeatures(r: ResoProperty): string[] {
  const raw = [r.InteriorFeatures, r.ExteriorFeatures, r.Appliances]
    .filter(Boolean)
    .join(',');
  return raw
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 2);
}

function buildImages(r: ResoProperty): string[] {
  if (!r.Media?.length) return [];
  return [...r.Media]
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map(m => m.MediaURL)
    .filter(Boolean);
}

function mapResoToProperty(r: ResoProperty): Property {
  return {
    id: r.ListingKey,
    mlsNumber: r.ListingId,
    mlsSource: 'GPRMLS',
    address: r.UnparsedAddress,
    city: r.City,
    state: r.StateOrProvince,
    zip: r.PostalCode,
    price: r.ListPrice,
    bedrooms: r.BedroomsTotal,
    bathrooms: r.BathroomsTotalInteger,
    sqft: r.LivingArea,
    lotSize: r.LotSizeArea
      ? `${r.LotSizeArea} ${r.LotSizeUnits ?? 'acres'}`
      : undefined,
    yearBuilt: r.YearBuilt,
    description: r.PublicRemarks,
    features: buildFeatures(r),
    images: buildImages(r),
    status: STATUS_MAP[r.StandardStatus] ?? 'active',
    listingDate: r.ListingContractDate,
    soldDate: r.CloseDate,
    soldPrice: r.ClosePrice,
    propertyType: r.PropertySubType?.toLowerCase().replace(/\s+/g, '-') ?? 'single-family',
    neighborhood: r.SubdivisionName ?? r.City,
    garage: r.GarageSpaces,
    coordinates:
      r.Latitude && r.Longitude
        ? { lat: r.Latitude, lng: r.Longitude }
        : undefined,
    openHouse:
      r.OpenHouseDate
        ? { date: r.OpenHouseDate, time: `${r.OpenHouseStartTime} – ${r.OpenHouseEndTime}` }
        : undefined,
    agent: agentProfile,
  };
}

// ─── RESO $select fields ──────────────────────────────────────────────────────
// Only request what we need — keeps response payloads small.

const SELECT_FIELDS = [
  'ListingKey', 'ListingId', 'ListPrice',
  'UnparsedAddress', 'City', 'StateOrProvince', 'PostalCode',
  'BedroomsTotal', 'BathroomsTotalInteger', 'LivingArea',
  'LotSizeArea', 'LotSizeUnits', 'YearBuilt',
  'PublicRemarks', 'StandardStatus',
  'ListingContractDate', 'CloseDate', 'ClosePrice',
  'PropertySubType', 'SubdivisionName',
  'GarageSpaces', 'Latitude', 'Longitude',
  'InteriorFeatures', 'ExteriorFeatures', 'Appliances',
  'OpenHouseDate', 'OpenHouseStartTime', 'OpenHouseEndTime',
  'Media',
].join(',');

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Search active/pending listings.
 *
 * When GPRMLS credentials are not configured this falls back to an empty array
 * so the app stays functional with mock data in the Angular adapters.
 */
export async function searchListings(filters?: PropertySearchFilters): Promise<Property[]> {
  if (!isConfigured()) {
    const active = mockProperties.filter(p => p.status !== 'sold');
    return applyClientFilters(active, filters);
  }

  const cacheKey = CacheKeys.listings(filters?.state);
  const cached = await cache.get<Property[]>(cacheKey);
  if (cached) return applyClientFilters(cached, filters);

  // Build $filter expression
  const filterParts = [`StandardStatus eq 'Active' or StandardStatus eq 'Pending'`];
  if (filters?.state) {
    filterParts.push(`StateOrProvince eq '${filters.state}'`);
  }

  const params = new URLSearchParams({
    '$filter': filterParts.join(' and '),
    '$select': SELECT_FIELDS,
    '$orderby': 'ListingContractDate desc',
    '$top': '200',
    '$expand': 'Media',
  });

  const data = await resoFetch<ResoODataResponse<ResoProperty>>(
    `Property?${params.toString()}`
  );

  const properties = data.value.map(mapResoToProperty);
  await cache.set(cacheKey, properties, config.listingCacheTtl);

  return applyClientFilters(properties, filters);
}

/**
 * Fetch Aaron's own listings (filtered by his agent MLS ID).
 */
export async function getAgentListings(): Promise<Property[]> {
  if (!isConfigured()) return mockProperties.filter(p => p.status !== 'sold');

  const cacheKey = `gprmls:agent:${config.agentMlsId}`;
  const cached = await cache.get<Property[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    '$filter': `ListAgentMlsId eq '${config.agentMlsId}'`,
    '$select': SELECT_FIELDS,
    '$orderby': 'ListingContractDate desc',
    '$top': '100',
    '$expand': 'Media',
  });

  const data = await resoFetch<ResoODataResponse<ResoProperty>>(
    `Property?${params.toString()}`
  );

  const properties = data.value.map(mapResoToProperty);
  await cache.set(cacheKey, properties, config.listingCacheTtl);

  return properties;
}

/** Fetch a single listing by MLS listing key. */
export async function getListingById(id: string): Promise<Property | null> {
  if (!isConfigured()) return mockProperties.find(p => p.id === id) ?? null;

  const cacheKey = CacheKeys.listing(id);
  const cached = await cache.get<Property>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      '$select': SELECT_FIELDS,
      '$expand': 'Media',
    });
    const data = await resoFetch<ResoProperty>(`Property('${id}')?${params.toString()}`);
    const property = mapResoToProperty(data);
    // Cache individual listings longer since they change rarely
    await cache.set(cacheKey, property, config.listingCacheTtl * 2);
    return property;
  } catch {
    return null;
  }
}

/** Fetch closed/sold listings. */
export async function getSoldListings(state?: string): Promise<Property[]> {
  if (!isConfigured()) {
    const sold = mockProperties.filter(p => p.status === 'sold');
    return state ? sold.filter(p => p.state === state) : sold;
  }

  const cacheKey = CacheKeys.soldListings(state);
  const cached = await cache.get<Property[]>(cacheKey);
  if (cached) return cached;

  const filterParts = [
    `StandardStatus eq 'Closed'`,
    `ListAgentMlsId eq '${config.agentMlsId}'`,
  ];
  if (state) filterParts.push(`StateOrProvince eq '${state}'`);

  const params = new URLSearchParams({
    '$filter': filterParts.join(' and '),
    '$select': SELECT_FIELDS,
    '$orderby': 'CloseDate desc',
    '$top': '50',
    '$expand': 'Media',
  });

  const data = await resoFetch<ResoODataResponse<ResoProperty>>(
    `Property?${params.toString()}`
  );

  const properties = data.value.map(mapResoToProperty);
  await cache.set(cacheKey, properties, config.listingCacheTtl * 6);
  return properties;
}

// ─── Client-side filter (applied after cache retrieval) ───────────────────────

function applyClientFilters(
  properties: Property[],
  filters?: PropertySearchFilters
): Property[] {
  if (!filters) return properties;

  return properties.filter(p => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [p.address, p.city, p.neighborhood, p.description, p.propertyType]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minBeds && p.bedrooms < filters.minBeds) return false;
    if (filters.minBaths && p.bathrooms < filters.minBaths) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
    if (filters.neighborhood && p.neighborhood !== filters.neighborhood) return false;
    if (filters.state && p.state !== filters.state) return false;
    return true;
  });
}
