import { BaseResponse } from "../../../types";
import { CountryCode } from "../../utils";
export interface SearchParams {
  query: string;
  spell_check?: boolean;
  max_results?: number;
  safe_search?: "strict" | "moderate" | "off";
  ai_overview?: boolean; // defaults to false on api side
  byo_urls?: string[];
  country_code?: CountryCode;
  auto_scrape?: boolean;
}

interface RelatedIndex {
  title: string;
  url: string;
  description: string;
  is_safe?: boolean;
}

export interface SearchResponse extends BaseResponse {
  query: string;
  ai_overview?: string;
  spell_fixed: boolean;
  is_safe: boolean;
  results: Array<{
    title: string;
    url: string;
    description: string;
    content:
      | string
      | {
          text: string;
          image_urls: string[];
          links: string[];
        };
    is_safe: boolean;
    site_name: string;
    site_long_name: string;
    age: string;
    language: string;
    favicon: string;
    snippets: string[];
    related_index: RelatedIndex[];
  }>;
  image_urls: string[];
  links: string[];
  geo_results: Array<{
    type: string;
    full_address: string;
    name: string;
    name_preferred: string;
    place_formatted: string;
    postcode?: string;
    district?: string;
    place?: string;
    region?: Omit<any, "mapbox_id">;
    country?: Omit<any, "mapbox_id">;
    language: string;
    geoloc: {
      type: string;
      coordinates: number[];
    };
    poi_category?: string;
    additional_properties?: any;
  }>;
}

export interface SuggestionResponse extends BaseResponse {
  suggestions: string[];
}
