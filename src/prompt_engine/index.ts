import { RequestClient } from "../request";
import { PromptCreateParams, PromptGetResponse, PromptListParams, PromptListResponse, PromptRunParams } from "./interfaces";

class PromptEngine {
  constructor(private readonly client: RequestClient) {}
  create = async (params: PromptCreateParams): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS("/prompt_engine", "POST", params);
  };
  run = async (params: PromptRunParams): Promise<{ result: string }> => {
    return await this.client.fetchJSS(`/prompt_engine/${params.id}`, "POST", params);
  };
  get = async (id: string): Promise<PromptGetResponse> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "GET", {});
  };
  list = async (params: PromptListParams): Promise<PromptListResponse> => {
    return await this.client.fetchJSS("/prompt_engine", "GET", {}, params);
  };
  delete = async (id: string): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "DELETE", {});
  };
}

export default PromptEngine;
