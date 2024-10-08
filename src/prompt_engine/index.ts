import { RequestClient } from "../request";
import { PromptCreateParams, PromptExecuteParams, PromptGetResponse, PromptListParams, PromptListResponse, PromptRunParams } from "./interfaces";

class PromptEngine {
  constructor(private readonly client: RequestClient) {}
  create = async (params: PromptCreateParams): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS("/prompt_engine", "POST", params);
  };
  run_prompt_direct = async <T>(params: PromptRunParams): Promise<{ result: T; success: boolean; message?: string }> => {
    return await this.client.fetchJSS(`/prompt_engine/run`, "POST", params);
  };
  get = async (id: string): Promise<PromptGetResponse> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "GET", {});
  };
  list = async (params: PromptListParams = { limit: 20, page: 0 }): Promise<PromptListResponse> => {
    return await this.client.fetchJSS("/prompt_engine", "GET", {}, params);
  };
  delete = async (id: string): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "DELETE", {});
  };
  run = async <T>(params: PromptExecuteParams): Promise<{ result: T; success: boolean }> => {
    return await this.client.fetchJSS(`/prompt_engine/${params.id}`, "POST", params);
  };
}

export default PromptEngine;
