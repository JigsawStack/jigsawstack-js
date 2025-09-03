import { BaseResponse } from "../../../types";
import { ScreenSizeNames } from "../../utils";

export interface HTMLAnyParams {
  html?: string | null;
  url?: string | null;
  goto_options?: {
    timeout: number;
    wait_until: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  } | null;
  full_page?: boolean;
  omit_background?: boolean;
  type?: "pdf" | "png" | "jpeg" | "webp";
  height?: number;
  width?: number;
  scale?: number;
  is_mobile?: boolean;
  dark_mode?: boolean;
  use_graphic_renderer?: boolean;
  size_preset?: ScreenSizeNames | null;
  pdf_display_header_footer?: boolean;
  pdf_print_background?: boolean;
  pdf_page_range?: string | null;
  return_type?: "url" | "binary" | "base64";
  quality?: number;
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
