import { BaseResponse } from "../../../types";
interface CookieParameter {
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

export type ScreenSizeNames =
  | "QVGA"
  | "VGA"
  | "SVGA"
  | "HD"
  | "SXGA"
  | "HD+"
  | "FHD"
  | "2K"
  | "2K QHD"
  | "5K"
  | "4K UHD"
  | "8K UHD"
  | "iPhone 13 Pro"
  | "iPhone XR"
  | "iPhone XS"
  | "iPhone XS Max"
  | "iPhone X"
  | "iPhone 8 Plus"
  | "iPhone 8"
  | "iPhone 7 Plus"
  | "iPhone 7"
  | "iPhone 6 Plus/6S Plus"
  | "iPhone 6/6S"
  | "iPhone 5"
  | "iPod Touch"
  | "iPad Pro"
  | "iPad Third & Fourth Generation"
  | "iPad Air 1 & 2"
  | "iPad Mini 2 & 3"
  | "iPad Mini"
  | "Nexus 6P"
  | "Nexus 5X"
  | "Google Pixel 7 Pro"
  | "Google Pixel 4 XL"
  | "Google Pixel 4"
  | "Google Pixel 3a XL"
  | "Google Pixel 3a"
  | "Google Pixel 3 XL"
  | "Google Pixel 3"
  | "Google Pixel 2 XL"
  | "Google Pixel XL"
  | "Google Pixel"
  | "Samsung Galaxy Note 10+"
  | "Samsung Galaxy Note 10"
  | "Samsung Galaxy Note 9"
  | "Samsung Galaxy Note 5"
  | "LG G5"
  | "One Plus 3"
  | "Samsung Galaxy S9+"
  | "Samsung Galaxy S9"
  | "Samsung Galaxy S8+"
  | "Samsung Galaxy S8"
  | "Samsung Galaxy S7 Edge"
  | "Samsung Galaxy S7"
  | "Nexus 9"
  | "Nexus 7 (2013)"
  | "Pixel C"
  | "Samsung Galaxy Tab 10"
  | "Chromebook Pixel"
  | "Letter"
  | "Legal"
  | "Tabloid"
  | "Ledger"
  | "A0"
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "Letter landscape"
  | "Legal landscape"
  | "Tabloid landscape"
  | "Ledger landscape"
  | "A0 landscape"
  | "A1 landscape"
  | "A2 landscape"
  | "A3 landscape"
  | "A4 landscape"
  | "A5 landscape"
  | "A6 landscape";
