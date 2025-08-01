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

export interface BaseAIScrapeParams {
  url?: string;
  html?: string;
  root_element_selector?: string;
  page_position?: number;
  http_headers?: object;
  reject_request_pattern?: string[];
  goto_options?: {
    timeout?: number;
    wait_until?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  } | null;
  wait_for?: {
    mode: string;
    value: string | number;
  };
  advance_config?: {
    console?: boolean;
    network?: boolean;
    cookies?: boolean;
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
  features?: Array<"meta" | "link"> | null;
}

export interface AIScrapeParamsWithSelector extends BaseAIScrapeParams {
  selectors: Array<string>;
  element_prompts?: string[];
}

export interface AIScrapeParamsWithPrompts extends BaseAIScrapeParams {
  selectors?: Array<string>;
  element_prompts?: string[];
}

export type AIScrapeParams = AIScrapeParamsWithSelector | AIScrapeParamsWithPrompts;

export interface AIScrapeResponse {
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
  page_position: number;
  page_position_length: number;
  advance_config:
    | {
        console?: any[];
        network?: any[];
        cookies?: any[];
      }
    | undefined;
  context: any;
  selectors: Record<string, Array<string>>;
  meta:
    | {
        title: string | undefined;
        description: string | undefined;
        keywords: string | undefined;
        og_image: string | undefined;
      }
    | undefined;
  link: Array<{
    href: string;
    text: string | null;
    type: "a" | "img";
  }>;
}
