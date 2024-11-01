import { BaseResponse } from "../../types";
import { Stream } from "../lib/streaming";

export interface PromptCreateParams {
  prompt: string;
  return_prompt?: string | Array<Record<string, any>> | Record<string, any>;
  inputs?: Array<{
    key: string;
    optional?: boolean;
    initial_value?: string;
  }>;
  // groq_key?: string;
}

export interface PromptRunParams extends PromptCreateParams {
  input_values?: Record<string, any>;
  streaming?: boolean;
}

export interface PromptExecuteParams {
  id: string;
  input_values?: Record<string, any>;
  streaming?: boolean;
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
  return_prompt: string;
  created_at: string;
}

export interface PromptGetResponse extends PromptResult {
  success: boolean;
}

export interface PromptListResponse extends PromptResult {
  prompt_engines: PromptResult[];
}

export interface RunPromptResponse {
  result: any;
  success: boolean;
  message?: string;
}

export interface RunPromptResponseStreaming<T> extends Stream<T> {}

export interface RunPromptDirectResponse extends RunPromptResponse {}
