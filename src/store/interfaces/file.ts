import { BaseResponse } from "../../../types";

export interface FileUploadParams {
  overwrite?: boolean;
  key?: string;
  content_type?: string;
}

export interface FileRetrieveParams {
  key: string;
}

export interface FileUploadResponse extends BaseResponse {
  key: string;
  url: string;
}
