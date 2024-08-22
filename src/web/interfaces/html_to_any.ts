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
}
