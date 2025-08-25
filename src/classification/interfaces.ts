import { BaseResponse } from "../../types";

export interface ClassificationResponse extends BaseResponse {
  predictions: (string | string[])[];
}

export interface ClassificationTextParams {
  dataset: Array<{
    type: "text";
    value: string;
  }>;
  labels: Array<{
    key?: string;
    type: "text";
    value: string;
  }>;
  multiple_labels?: boolean;
}

export interface ClassificationImageParams {
  dataset: Array<{
    type: "image";
    value: string;
  }>;
  labels: Array<{
    key?: string;
    type: "image" | "text";
    value: string;
  }>;
  multiple_labels?: boolean;
}
