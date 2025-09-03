import { BaseResponse } from "../../../types";
import { ScreenSizeNames } from "../../utils";

interface CookieParameter {
  name: string;
  value: string;
  domain?: string;
  url?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameParty?: boolean;
  expires?: number;
  priority?: "Low" | "High" | "Medium";
}

export interface BaseAIScrapeParams {
  url?: string | null;
  html?: string | null;
  http_headers?: Record<string, string> | null;
  reject_request_pattern?: string[] | null;
  goto_options?: {
    timeout?: number;
    wait_until?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  } | null;
  wait_for?: {
    mode: "selector" | "timeout" | "function";
    value: string | number;
  } | null;
  advance_config?: {
    console?: boolean;
    network?: boolean;
    cookies?: boolean;
  } | null;
  size_preset?: ScreenSizeNames | null;
  is_mobile?: boolean;
  scale?: number;
  width?: number;
  height?: number;
  cookies?: Array<CookieParameter> | null;
  force_rotate_proxy?: boolean;
  byo_proxy?: {
    server: string;
    auth?: {
      username: string;
      password: string;
    };
  } | null;
  features?: Array<"meta" | "link"> | null;
  selectors?: Array<string> | null;
}

export interface AIScrapeParams extends BaseAIScrapeParams {
  element_prompts?: string[] | null;
  root_element_selector?: string;
  page_position?: number;
}

export interface AIScrapeResponse extends BaseResponse {
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
        console?: any;
        network?: {
          url: string;
          method: string;
          status: number;
          headers: Record<string, string>;
          body: string | null;
          type: "request" | "response";
        };
        cookies?: any;
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
