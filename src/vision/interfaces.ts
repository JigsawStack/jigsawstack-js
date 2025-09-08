import { BaseResponse } from "../../types";

export type VOCRParams = {
  prompt?: string | string[] | Record<string, string>;
  url?: string;
  file_store_key?: string;
  page_range?: Array<number>;
};

export interface VOCRResponse extends BaseResponse {
  context?: string | Record<string, string[]>;
  width: number;
  height: number;
  tags: string[];
  has_text: boolean;
  sections: Array<{
    text: string;
    lines: Array<{
      text: string;
      bounds: BoundingBox;
      words: Array<{
        text: string;
        bounds: BoundingBox;
      }>;
    }>;
  }>;
  total_pages?: number; // only available for PDFs
  page_range?: Array<number>; // only available when page_range is specified
}

export type ObjectDetectionParams = {
  url?: string;
  file_store_key?: string;
  prompts?: string[];
  features?: ("object_detection" | "gui")[];
  annotated_image?: boolean;
  return_type?: "url" | "base64";
  return_masks?: boolean;
};

export interface ObjectDetectionResponse extends BaseResponse {
  // Optional annotated image - included only if annotated_image=true and objects/gui_elements exist
  annotated_image?: string; // URL or base64 string depending on return_type

  // Optional GUI elements - included only if features includes "gui"
  gui_elements?: GuiElement[];

  // Optional detected objects - included only if features includes "object_detection"
  objects?: DetectedObject[];

  tags?: string[];
}

interface GuiElement {
  bounds: BoundingBox;
  content: string | null; // Can be null if no object detected
  interactivity: boolean;
  type: string;
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
