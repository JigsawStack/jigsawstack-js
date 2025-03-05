import { BaseResponse } from "../../types";

interface GeoParams {
  search_value: string;
  lat: string;
  lng: string;
  country_code: string;
  proximity_lat: string;
  proximity_lng: string;
  types: string;
  city_code: string;
  state_code: string;
  limit: number;
}

export interface GeoSearchParams {
  search_value: string;
  country_code?: string;
  proximity_lat?: string;
  proximity_lng?: string;
  types?: string;
}

interface Geoloc {
  type: string;
  coordinates: number[];
}

interface Region {
  name: string;
  region_code: string;
  region_code_full: string;
}

interface Country {
  name: string;
  country_code: string;
  country_code_alpha_3: string;
}

interface GeoSearchResult {
  type: string;
  full_address: string;
  name: string;
  place_formatted: string;
  postcode: string;
  place: string;
  region: Region;
  country: Country;
  language: string;
  geoloc: Geoloc;
  poi_category: string[];
  addtional_properties: Record<string, any>;
}

export interface GeoSearchResponse extends BaseResponse {
  data: GeoSearchResult[];
}

export interface GeocodeParams extends Omit<GeoParams, "state_code" | "city_code"> {}
