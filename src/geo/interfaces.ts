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

interface CityResult {
  state_code: string;
  name: string;
  city_code: string;
  state: StateResult;
}

interface CountryResult {
  country_code: string;
  name: string;
  iso2: string;
  iso3: string;
  capital: string;
  phone_code: string;
  region: string;
  subregion: string;
  currency_code: string;
  geoloc: Geoloc;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  emoji: string;
  emojiU: string;
  latitude: number;
  longitude: number;
}

interface StateResult {
  state_code: string;
  name: string;
  country_code: string;
  country: CountryResult;
}

export interface GeoSearchResponse extends BaseResponse {
  data: GeoSearchResult[];
}

export interface GeocodeParams extends Omit<GeoParams, "state_code" | "city_code"> {}

// Geo City
export interface GeoCityParams extends Pick<GeoParams, "country_code" | "city_code" | "state_code" | "search_value" | "lat" | "lng" | "limit"> {}

export interface GeoCityResponse extends BaseResponse {
  city: CityResult[];
}

// Geo Country
export interface GeoCountryParams extends Pick<GeoParams, "country_code" | "city_code" | "search_value" | "lat" | "lng" | "limit"> {
  currency_code: string;
}

export interface GeoCountryResponse extends BaseResponse {
  country: CountryResult[];
}

// Geo State

export interface GeoStateParams extends Pick<GeoParams, "country_code" | "state_code" | "search_value" | "lat" | "lng" | "limit"> {}

export interface GeoStateResponse extends BaseResponse {
  state: StateResult[];
}

// Distance params

export interface GeoDistanceParams {
  unit?: "K" | "N";
  lat1: string;
  lng1: string;
  lat2: string;
  lng2: string;
}

export interface GeoDistanceResponse extends BaseResponse {
  distance: number;
}

// Timezone params
export interface GeoTimezoneParams extends Pick<GeoParams, "lat" | "lng" | "city_code" | "country_code"> {}

export interface GeoTimezoneResponse extends BaseResponse {
  timezone: {
    abbr: string;
    name: string;
    offset: number;
    zone_name: string;
    gmt_offset: number;
    gmt_offset_name: string;
  };
}

// Geohash params

export interface GeohashParams extends Pick<GeoParams, "lat" | "lng"> {
  precision: number;
}

export interface GeohashResponse extends BaseResponse {
  geohash: string;
}

export interface GeohashDecodeResponse extends BaseResponse {
  latitude: number;
  longitude: number;
}
