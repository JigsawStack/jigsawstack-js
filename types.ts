export interface BaseResponse {
  success: boolean;
  _usage?: {
    input_tokens: number;
    output_tokens: number;
    inference_time_tokens: number;
    total_tokens: number;
  };
}

export interface BaseConfig {
  apiKey?: string;
  baseURL?: string;
  disableRequestLogging?: boolean; // Controls how requests are logged. Default is false.
}
