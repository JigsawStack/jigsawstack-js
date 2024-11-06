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
  RunPromptResponseStreaming,
} from "./interfaces";

class PromptEngine {
  constructor(private readonly client: RequestClient) {}
  create = async (params: PromptCreateParams): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS("/prompt_engine", "POST", params);
  };

  run_prompt_direct<T>(params: PromptRunParams & { streaming: true }): Promise<RunPromptResponseStreaming<T>>;
  run_prompt_direct(params: PromptRunParams & { streaming?: false }): Promise<RunPromptDirectResponse>;
  async run_prompt_direct<T>(params: PromptRunParams): Promise<RunPromptDirectResponse | RunPromptResponseStreaming<T>> {
    const resp = await this.client.fetchJSS(`/prompt_engine/run`, "POST", params);
    if (!params.streaming) {
      return resp as RunPromptDirectResponse;
    }
    return Stream.fromReadableStream<T>(resp.body) as RunPromptResponseStreaming<T>;
  }
  get = async (id: string): Promise<PromptGetResponse> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "GET", {});
  };
  list = async (params: PromptListParams = { limit: 20, page: 0 }): Promise<PromptListResponse> => {
    return await this.client.fetchJSS("/prompt_engine", "GET", {}, params);
  };
  delete = async (id: string): Promise<{ prompt_engine_id: string }> => {
    return await this.client.fetchJSS(`/prompt_engine/${id}`, "DELETE", {});
  };
  run<T>(params: PromptExecuteParams & { streaming: true }): Promise<RunPromptResponseStreaming<T>>;
  run(params: PromptExecuteParams & { streaming?: false }): Promise<RunPromptResponse>;
  async run<T>(params: PromptExecuteParams): Promise<RunPromptResponseStreaming<T> | RunPromptResponse> {
    const resp = await this.client.fetchJSS(`/prompt_engine/${params.id}`, "POST", params);
    if (!params.streaming) {
      return resp as RunPromptResponse;
    }
    return Stream.fromReadableStream<T>(resp.body) as RunPromptResponseStreaming<T>;
  }
}

export default PromptEngine;
