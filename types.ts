export interface BaseResponse {
  success: boolean;
}

export interface BaseConfig {
  apiKey?: string;
  baseURL?: string;
  disableRequestLogging?: boolean; // Controls how requests are logged. Default is false.
}
