export type VOCRParams = {
  prompt: string | string[];
  page_range?: Array<number>;
} & ({ url: string; file_store_key?: never } | { file_store_key: string; url?: never });

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

export type ObjectDetectionParams = {
  prompts?: string[];
  features?: ("object_detection" | "gui")[];
  annotated_image?: boolean;
  return_type?: "url" | "base64";
} & ({ url: string; file_store_key?: never } | { file_store_key: string; url?: never });

export interface ObjectDetectionResponse {
  // Optional annotated image - included only if annotated_image=true and objects/gui_elements exist
  annotated_image?: string; // URL or base64 string depending on return_type

  // Optional GUI elements - included only if features includes "gui"
  gui_elements?: GuiElement[];

  // Optional detected objects - included only if features includes "object_detection"
  objects?: DetectedObject[];
}

interface GuiElement {
  bounds: BoundingBox;
  content: string | null; // Can be null if no object detected
}

interface DetectedObject {
  bounds: BoundingBox;
  label: string;
  mask?: string; // URL or base64 string depending on return_type - only present for some objects
}

interface BoundingBox {
  top_left: Point;
  top_right: Point;
  bottom_left: Point;
  bottom_right: Point;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}
