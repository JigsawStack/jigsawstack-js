import { RequestClient } from "../request";
import { SearchParams, SearchResponse, SuggestionResponse } from "./interfaces";
class Search {
  constructor(private readonly client: RequestClient) {}
  ai = async (params: SearchParams): Promise<SearchResponse> => {
    return await this.client.fetchJSS("/ai/scrape", "POST", params);
  };
  suggestion = async (query: string): Promise<SuggestionResponse> => {
    return await this.client.fetchJSS(`/web/search/suggest?query=${query}`, "GET", {});
  };
}

export default Search;
