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
  force_rotate_proxy?: boolean;
  byo_proxy?: {
    server: string;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export interface ScrapeResponse {
  success: boolean;
  data: Array<{
    key: string;
    selector: string;
    results: Array<{
      html: string;
      text: string;
      attributes: Array<{
        name: string;
        value: string;
      }>;
    }>;
  }>;
}

export interface AIScrapeResponse extends ScrapeResponse {
  page_position: number;
  page_position_length: number;
  context: Record<string, Array<string>>;
  selectors: Record<string, Array<string>>;
  link: Array<{
    href: string;
    text: string | null;
    type: "a" | "img";
  }>;
}

export interface AIScrapeParams extends Omit<ScrapeParams, "elements"> {
  element_prompts: string[];
  root_element_selector?: string;
  page_position?: number;
}
