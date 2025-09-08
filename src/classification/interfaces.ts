import { BaseResponse } from "../../types";

export interface ClassificationResponse extends BaseResponse {
  predictions: (string | string[])[];
}

export interface ClassificationParams {
  dataset: Array<{
    type: "text" | "image";
    value: string;
  }>;
  labels: Array<{
    key?: string;
    type: "text" | "image";
    value: string;
  }>;
  multiple_labels?: boolean;
}
