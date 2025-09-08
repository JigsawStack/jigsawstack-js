import { Stream } from "../lib/streaming";
import { RequestClient } from "../request";
import {
  PromptCreateParams,
  PromptExecuteParams,
  PromptGetResponse,
  PromptListParams,
  PromptListResponse,
  PromptRunParams,
  RunPromptDirectResponse,
  RunPromptResponse,
  RunPromptResponseStream,
  CreatePromptResponse,
} from "./interfaces";

class PromptEngine {
  constructor(private readonly client: RequestClient) {}
  create = async (params: PromptCreateParams): Promise<CreatePromptResponse> => {
    return await this.client.fetchJSS("/v1/prompt_engine", "POST", params);
  };

  run_prompt_direct(params: PromptRunParams & { stream: true }): Promise<RunPromptResponseStream<string>>;
  run_prompt_direct(params: PromptRunParams & { stream?: false }): Promise<RunPromptDirectResponse>;
  async run_prompt_direct(params: PromptRunParams): Promise<RunPromptDirectResponse | RunPromptResponseStream<string>> {
    const resp = await this.client.fetchJSS(`/v1/prompt_engine/run`, "POST", params);
    if (!params.stream) {
      return resp as RunPromptDirectResponse;
    }
    return Stream.fromReadableStream<string>(resp.body) as RunPromptResponseStream<string>;
  }
  get = async (id: string): Promise<PromptGetResponse> => {
    return await this.client.fetchJSS(`/v1/prompt_engine/${id}`, "GET", {});
  };
  list = async (params: PromptListParams = { limit: 20, page: 0 }): Promise<PromptListResponse> => {
    return await this.client.fetchJSS("/v1/prompt_engine", "GET", {}, params);
  };
  delete = async (id: string): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS(`/v1/prompt_engine/${id}`, "DELETE", {});
  };
  run(params: PromptExecuteParams & { stream: true }): Promise<RunPromptResponseStream<string>>;
  run(params: PromptExecuteParams & { stream?: false }): Promise<RunPromptResponse>;
  async run(params: PromptExecuteParams): Promise<RunPromptResponseStream<string> | RunPromptResponse> {
    const resp = await this.client.fetchJSS(`/v1/prompt_engine/${params.id}`, "POST", params);
    if (!params.stream) {
      return resp as RunPromptResponse;
    }
    return Stream.fromReadableStream<string>(resp.body) as RunPromptResponseStream<string>;
  }
}

export default PromptEngine;
