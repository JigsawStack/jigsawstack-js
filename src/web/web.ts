import { RequestClient } from "../request";
import { DNSParams, DNSResponse } from "./interfaces/dns";
import { HTMLAnyParams } from "./interfaces/html_to_any";
import { AIScrapeParams, ScrapeParams, ScrapeResponse } from "./interfaces/scrape";
class Web {
  constructor(private readonly client: RequestClient) {}

  ai_scrape = async (params: AIScrapeParams): Promise<ScrapeResponse> => {
    return await this.client.fetchJSS("/ai/scrape", "POST", params);
  };

  scrape = async (params: ScrapeParams): Promise<ScrapeResponse> => {
    return await this.client.fetchJSS("/web/scrape", "POST", params);
  };

  dns = async (params: DNSParams): Promise<DNSResponse> => {
    return await this.client.fetchJSS("/web/dns", "GET", {}, params);
  };

  html_to_any = async (params: HTMLAnyParams): Promise<Blob> => {
    const resp = await this.client.fetchJSS("/web/html_to_any", "POST", params);
    return resp;
  };
}

export default Web;
