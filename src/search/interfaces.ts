export interface SearchParams {
  query: string;
  ai_overview?: boolean;
  safe_search?: "moderate" | "strict" | "off";
  spell_check?: boolean;
  byo_urls?: string[];
}

interface RelatedIndex {
  title: string;
  url: string;
  description: string;
  is_safe?: boolean;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  ai_overview?: string;
  is_safe: boolean;
  spell_fixed?: string;
  results: {
    title: string;
    url: string;
    description: string;
    content: string;
    is_safe: boolean;
    site_name: string;
    site_long_name: string;
    age: string;
    language: string;
    favicon: string;
    snippets: string[];
    related_index: RelatedIndex[];
  }[];
  image_urls: string[];
  links: string[];
  geo_results: {
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
  }[];
}

export interface SuggestionResponse {
  success: boolean;
  suggestions: string[];
}
