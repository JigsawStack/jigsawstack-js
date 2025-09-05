import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { DeepResearchParams, DeepResearchResponse } from "./interfaces/deep_research";
import { HTMLAnyParams } from "./interfaces/html_to_any";
import { AIScrapeParams, AIScrapeResponse } from "./interfaces/scrape";
import { SearchParams, SearchResponse, SuggestionResponse } from "./interfaces/search";
class Web {
  constructor(private readonly client: RequestClient) {}

  ai_scrape = async (params: AIScrapeParams): Promise<AIScrapeResponse> => {
    return await this.client.fetchJSS("/v1/ai/scrape", "POST", params);
  };

  html_to_any = async (params: HTMLAnyParams) => {
    const resp = await this.client.fetchJSS("/v1/web/html_to_any", "POST", params);
    return respToFileChoice(resp);
  };

  deep_research = async (params: DeepResearchParams): Promise<DeepResearchResponse> => {
    return await this.client.fetchJSS("/v1/web/deep_research", "POST", params);
  };

  search = async (params: SearchParams): Promise<SearchResponse> => {
    return await this.client.fetchJSS("/v1/web/search", "POST", params);
  };
  search_suggestions = async (query: string): Promise<SuggestionResponse> => {
    return await this.client.fetchJSS(`/v1/web/search/suggest?query=${query}`, "GET", undefined);
  };
}

export default Web;
