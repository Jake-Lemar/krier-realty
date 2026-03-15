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
  status: 'active' | 'pending' | 'sold';
  listingDate: string;
  soldDate?: string;
  soldPrice?: number;
  mlsNumber: string;
  mlsSource: string;
  neighborhood: string;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  garage?: number;
  agent: AgentProfile;
  coordinates?: { lat: number; lng: number };
  openHouse?: { date: string; time: string };
}

export interface AgentProfile {
  name: string;
  phone: string;
  email: string;
  photo: string;
  bio: string;
  /** Primary display license (e.g. "NE-45821") */
  licenseNumber: string;
  /** All state licenses for multi-state agents */
  stateLicenses: { state: string; number: string }[];
  title: string;
}

export interface PropertySearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  propertyType?: string;
  status?: 'active' | 'pending' | 'sold' | 'all';
  neighborhood?: string;
  /** Filter by state abbreviation, e.g. 'NE' or 'IA' */
  state?: string;
  /** Filter by MLS source ID, e.g. 'GPRMLS' or 'IMLS' */
  mlsSource?: string;
}

export interface Lead {
  type: 'buyer' | 'seller' | 'contact' | 'tour';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  source: string;
  address?: string;
  preferredContact?: string;
}
