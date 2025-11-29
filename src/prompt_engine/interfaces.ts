import { Stream } from "../lib/streaming";

export interface PromptCreateParams {
  /** Name of the prompt engine. Max 300 characters. */
  name?: string;
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

export interface RunPromptResponseStream<T> extends Stream<T> {}

export interface RunPromptDirectResponse extends RunPromptResponse {}
