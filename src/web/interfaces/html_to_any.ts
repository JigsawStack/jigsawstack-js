import { BaseResponse } from "../../../types";

export interface HTMLAnyParams {
  html?: string;
  url?: string;
  use_graphic_renderer?: boolean;
  dark_mode?: boolean;
  is_mobile?: boolean;
  pdf_page_range?: string;
  pdf_print_background?: boolean;
  pdf_display_header_footer?: boolean;
  size_preset?: string;
  height?: number;
  width?: number;
  type?: string;
  quality?: number;
  omit_background?: boolean;
  full_page?: boolean;
  scale?: number;
  goto_options?: {
    timeout: number;
    wait_until: string;
  };
  return_type?: "url" | "binary" | "base64";
}

// response for "url" and "base64" return types (both return url string)
export interface HTMLAnyURLResponse extends BaseResponse {
  url: string;
}

export interface HTMLAnyBinaryResponse extends Response {
  // binary response doesn't have structure
}

export interface HTMLAnyURLParams extends Omit<HTMLAnyParams, "return_type"> {
  return_type: "url" | "base64";
}

export interface HTMLAnyBinaryParams extends Omit<HTMLAnyParams, "return_type"> {
  return_type: "binary";
}

export type HTMLAnyResponse = HTMLAnyURLResponse | HTMLAnyBinaryResponse;
