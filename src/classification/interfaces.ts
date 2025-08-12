import { BaseResponse } from "../../types";

export interface DatasetItem {
  type: "text" | "image";
  value: string;
}

export interface LabelItem {
  key?: string;
  type: "text" | "image";
  value: string;
}

export interface ClassificationParams {
  dataset: DatasetItem[];
  labels: LabelItem[];
  multiple_labels?: boolean;
}

export interface ClassificationResponse extends BaseResponse {
  predictions: string[] | string[][];
}
