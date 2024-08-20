export interface VOCRParams {
  prompt: string | string[];
  url?: string;
  file_store_key?: string;
}

export interface VOCRResponse {
  success: boolean;
  context: string;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<any>;
}

export interface ObjectDetentionParams {
  url: string;
  ile_store_key: string;
}

export interface ObjectDetectionResponse extends Omit<VOCRResponse, "context"> {
  success: boolean;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<any>;
}
