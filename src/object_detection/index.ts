import { RequestClient } from "../request";

interface ObjectDetectionParams {
  url?: string;
  file_store_key?: string;
  prompts?: string[];
  features?: ("object_detection" | "gui")[];
  annotated_image?: boolean;
  return_type?: "url" | "base64";
}

interface ObjectDetectionResponse {
  // Optional annotated image - included only if annotated_image=true and objects/gui_elements exist
  annotated_image?: string; // URL or base64 string depending on return_type

  // Optional GUI elements - included only if features includes "gui"
  gui_elements?: GuiElement[];

  // Optional detected objects - included only if features includes "object_detection"
  objects?: DetectedObject[];

  // Optional usage statistics
  _usage?: UsageStats;
}

interface GuiElement {
  bounds: BoundingBox;
  content: string | null; // Can be null if no object detected
}

interface DetectedObject {
  bounds: BoundingBox;
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

interface UsageStats {
  // The exact structure depends on the RunPod response
  // You may need to examine actual responses to define this precisely
  [key: string]: any;
}

class ObjectDetection {
  constructor(private readonly client: RequestClient) {}
  detect = async (params: ObjectDetectionParams): Promise<ObjectDetectionResponse> => {
    return await this.client.fetchJSS("/ai/object_detection", "POST", params);
  };
}

export default ObjectDetection;
