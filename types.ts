export interface BaseResponse {
  success: boolean;
}

export interface BaseConfig {
  apiKey?: string;
  baseURL?: string;
  extraConfig?: {
    disableRequestLogging?: boolean; // Controls how requests are logged. Default is false.
  };
}
