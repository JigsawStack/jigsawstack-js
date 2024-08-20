export interface CookieParameter {
  name: string;
  value: string;
  url?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: boolean;
  priority?: string;
  sameParty?: boolean;
}

export interface ScrapeParams {
  url: string;
  elements?: Array<{
    selector: string;
  }>;
  http_headers?: object;
  reject_request_pattern?: string[];
  goto_options?: {
    timeout: number;
    wait_until: string;
  };
  wait_for?: {
    mode: string;
    value: string | number;
  };
  advance_config?: {
    console: boolean;
    network: boolean;
    cookies: boolean;
  };
  size_preset?: string;
  is_mobile?: boolean;
  scale?: number;
  width?: number;
  height?: number;
  cookies?: Array<CookieParameter>;
}

export interface ScrapeResponse {
  success: boolean;
  data: any;
}

export interface AIScrapeParams extends Omit<ScrapeParams, "elements"> {
  element_prompts: string[];
}
