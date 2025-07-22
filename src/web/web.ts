import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { DeepResearchParams, DeepResearchResponse } from "./interfaces/deep_research";
import { HTMLAnyParams } from "./interfaces/html_to_any";
import { AIScrapeParams, AIScrapeResponse } from "./interfaces/scrape";
class Web {
  constructor(private readonly client: RequestClient) {}

  ai_scrape = async (params: AIScrapeParams): Promise<AIScrapeResponse> => {
    return await this.client.fetchJSS("/ai/scrape", "POST", params);
  };

  html_to_any = async (params: HTMLAnyParams) => {
    const resp = await this.client.fetchJSS("/web/html_to_any", "POST", params);
    return respToFileChoice(resp);
  };

  deep_research = async (params: DeepResearchParams): Promise<DeepResearchResponse> => {
    return await this.client.fetchJSS("/web/deep_research", "POST", params);
  };
}

export default Web;
