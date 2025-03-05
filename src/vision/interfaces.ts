export interface VOCRParams {
  prompt: string | string[];
  url?: string;
  file_store_key?: string;
  page_range?: Array<number>;
}

interface Bounds {
  top_left: {
    x: number;
    y: number;
  };
  top_right: {
    x: number;
    y: number;
  };
  bottom_left: {
    x: number;
    y: number;
  };
  bottom_right: {
    x: number;
    y: number;
  };
}

export interface VOCRResponse {
  success: boolean;
  context: string;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<{
    text: string;
    lines: Array<{
      text: string;
      bounds: Bounds;
      words: Array<{
        text: string;
        bounds: Bounds;
      }>;
    }>;
  }>;
  total_pages?: number; // only available for PDFs
  page_range?: Array<number>; // only available when page_range is specified
}

export interface ObjectDetentionParams {
  url?: string;
  file_store_key?: string;
}

export interface ObjectDetectionResponse extends Omit<VOCRResponse, "context"> {
  success: boolean;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<any>;
}
