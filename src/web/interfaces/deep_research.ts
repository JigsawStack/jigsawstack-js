import { BaseResponse } from "../../../types";
import { CountryCode } from "./search";
// Input parameters interface for reference
export interface DeepResearchParams {
  query: string;
  spell_check?: boolean;
  safe_search?: "strict" | "moderate" | "off";
  country_code?: CountryCode | null;
  max_depth?: number;
  max_breadth?: number;
  max_output_tokens?: number;
  target_output_tokens?: number;
}

export interface DeepResearchResponse extends BaseResponse {
  query: string;
  results: string;
  sources: SearchResult[];
  geo_results: GeoResult[];
  image_urls: string[];
  links: string[];
}

interface SearchResult {
  title?: string;
  url?: string;
  description?: string;
  content: string | null;
  site_name?: string;
  site_long_name?: string;
  age?: string; // ISO date string
  language?: string;
  image_urls: string[];
  links: string[];
  is_safe?: boolean;
  favicon: string;
  thumbnail?: string;
  snippets?: any[];
  related_index?: RelatedResult[];
}

interface RelatedResult {
  title?: string;
  url?: string;
  description?: string;
  is_safe?: boolean;
}

interface GeoResult {
  type: string;
  full_address: string;
  name: string;
  name_preferred?: string;
  place_formatted?: string;
  postcode?: string;
  district?: string;
  place?: string;
  region?: {
    name: string;
    region_code?: string;
    region_code_full?: string;
  };
  country?: {
    name: string;
    country_code?: string;
    country_code_alpha_3?: string;
  };
  language: string;
  geoloc: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  poi_category?: string[];
  additional_properties?: any;
}
