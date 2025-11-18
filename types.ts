export interface BaseResponse {
  success: boolean;
  _usage?: {
    input_tokens: number;
    output_tokens: number;
    inference_time_tokens: number;
    total_tokens: number;
  };
  log_id: string;
}

export interface BaseConfig {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>; // Additional headers to be sent with the request.
}
