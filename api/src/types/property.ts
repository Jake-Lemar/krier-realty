// Shared property types — mirror of the Angular frontend model.
// Keep these in sync when adding fields.

export interface StateLicense {
  state: string;
  number: string;
}

export interface AgentProfile {
  name: string;
  phone: string;
  email: string;
  photo: string;
  bio: string;
  title: string;
  licenseNumber: string;
  stateLicenses: StateLicense[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OpenHouse {
  date: string;
  time: string;
}

export type PropertyStatus = 'active' | 'pending' | 'sold';

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: string;
  yearBuilt?: number;
  description: string;
  features: string[];
  images: string[];
  status: PropertyStatus;
  listingDate: string;
  soldDate?: string;
  soldPrice?: number;
  mlsNumber: string;
  mlsSource: string;
  neighborhood: string;
  propertyType: string;
  garage?: number;
  agent: AgentProfile;
  coordinates?: Coordinates;
  openHouse?: OpenHouse;
}

export interface PropertySearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  propertyType?: string;
  status?: PropertyStatus;
  neighborhood?: string;
  state?: string;
  mlsSource?: string;
}

export interface Lead {
  type: 'buyer' | 'seller' | 'contact' | 'tour';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  address?: string;
  preferredContact?: string;
  source?: string;
}

// ─── RESO Web API response shapes ─────────────────────────────────────────────

export interface ResoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface ResoMedia {
  MediaURL: string;
  Order?: number;
  MediaCategory?: string;
}

/** Subset of RESO standard fields we care about. */
export interface ResoProperty {
  ListingKey: string;
  ListingId: string;
  ListPrice: number;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  LivingArea: number;
  LotSizeArea?: number;
  LotSizeUnits?: string;
  YearBuilt?: number;
  PublicRemarks: string;
  StandardStatus: 'Active' | 'ActiveUnderContract' | 'Pending' | 'Closed' | 'Withdrawn' | 'Expired';
  ListingContractDate: string;
  CloseDate?: string;
  ClosePrice?: number;
  PropertySubType?: string;
  SubdivisionName?: string;
  GarageSpaces?: number;
  Latitude?: number;
  Longitude?: number;
  Media?: ResoMedia[];
  InteriorFeatures?: string;
  ExteriorFeatures?: string;
  Appliances?: string;
  // Open house fields (non-standard, Paragon extension)
  OpenHouseDate?: string;
  OpenHouseStartTime?: string;
  OpenHouseEndTime?: string;
}

export interface ResoODataResponse<T> {
  '@odata.context': string;
  '@odata.nextLink'?: string;
  value: T[];
}
