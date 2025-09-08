import { Stream } from "../lib/streaming";
import { BaseResponse } from "../../types";
export interface PromptCreateParams {
  prompt: string;
  return_prompt?: string | Array<Record<string, any>> | Record<string, any>;
  inputs?: Array<{
    key: string;
    optional?: boolean;
    initial_value?: string;
  }>;
  use_internet?: boolean;
  optimize_prompt?: boolean;
  prompt_guard?: Array<
    | "defamation"
    | "specialized_advice"
    | "privacy"
    | "intellectual_property"
    | "indiscriminate_weapons"
    | "hate"
    | "sexual_content"
    | "elections"
    | "code_interpreter_abuse"
  >;
}

export interface PromptRunParams extends Omit<PromptCreateParams, "optimize_prompt"> {
  input_values?: Record<string, any>;
  stream?: boolean;
}

export interface PromptExecuteParams {
  id: string;
  input_values?: Record<string, any>;
  stream?: boolean;
}

export interface PromptListParams {
  page?: number;
  limit?: number;
}

export interface PromptResult {
  id: string;
  prompt: string;
  inputs: Array<{
    key: string;
    optional: boolean;
  }>;
  return_prompt: string | null | undefined;
  return_prompt_type: "json" | "string";
  created_at: string;
}

export interface PromptGetResponse extends PromptResult {
  success: boolean;
  _usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PromptListResponse extends BaseResponse {
  prompt_engines: PromptResult[];
}

export interface RunPromptResponse extends BaseResponse {
  result: any;
  message: string;
}

export interface CreatePromptResponse extends BaseResponse {
  prompt_engine_id: string;
  optimized_prompt: string;
}

export interface RunPromptResponseStream<T> extends Stream<T> {}

export interface RunPromptDirectResponse extends RunPromptResponse {}

export interface PromptEngineCreateResponse extends BaseResponse {
  prompt_engine_id: string;
  optimized_prompt?: string;
}
