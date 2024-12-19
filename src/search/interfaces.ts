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
  spell_fixed: string;
  is_safe: boolean;
  ai_overview: string;
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
}

export interface SuggestionResponse {
  success: boolean;
  suggestions: string[];
}
