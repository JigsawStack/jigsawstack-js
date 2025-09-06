import { RequestClient } from "../request";
import { DeepResearchParams, DeepResearchResponse } from "./interfaces/deep_research";
import { HTMLAnyBinaryParams, HTMLAnyBinaryResponse, HTMLAnyParams, HTMLAnyURLParams, HTMLAnyURLResponse } from "./interfaces/html_to_any";
import { AIScrapeParams, AIScrapeResponse } from "./interfaces/scrape";
import { SearchParams, SearchResponse, SuggestionResponse } from "./interfaces/search";
class Web {
  constructor(private readonly client: RequestClient) {}

  ai_scrape = async (params: AIScrapeParams): Promise<AIScrapeResponse> => {
    return await this.client.fetchJSS("/ai/scrape", "POST", params);
  };

  // Simplified function overloads
  html_to_any(params: HTMLAnyURLParams): Promise<HTMLAnyURLResponse>;
  html_to_any(params: HTMLAnyBinaryParams): Promise<HTMLAnyBinaryResponse>;
  html_to_any(params: HTMLAnyParams): Promise<HTMLAnyURLResponse | HTMLAnyBinaryResponse>;
  async html_to_any(params: HTMLAnyParams): Promise<HTMLAnyURLResponse | HTMLAnyBinaryResponse> {
    if (params.return_type === "binary") {
      return (await this.client.fetchJSS("/web/html_to_any", "POST", params)) as HTMLAnyBinaryResponse;
    }
    // For both "url" and "base64", return the same structure with url property
    return (await this.client.fetchJSS("/web/html_to_any", "POST", params)) as HTMLAnyURLResponse;
  }

  deep_research = async (params: DeepResearchParams): Promise<DeepResearchResponse> => {
    return await this.client.fetchJSS("/web/deep_research", "POST", params);
  };

  search = async (params: SearchParams): Promise<SearchResponse> => {
    return await this.client.fetchJSS("/web/search", "POST", params);
  };
  search_suggestions = async ({ query }: { query: string }): Promise<SuggestionResponse> => {
    return await this.client.fetchJSS(`/web/search/suggest?query=${query}`, "GET", undefined);
  };
}

export default Web;
