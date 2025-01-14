export interface VOCRParams {
  prompt: string | string[];
  url?: string;
  file_store_key?: string;
  page_range?: Array<number>;
}

export interface VOCRResponse {
  success: boolean;
  context: string;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<any>;
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
