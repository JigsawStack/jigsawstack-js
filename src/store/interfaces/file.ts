import { BaseResponse } from "../../../types";

export interface FileUploadParams {
  overwrite?: boolean;
  key?: string;
  content_type?: string;
  temp_public_url?: boolean;
}

export interface FileRetrieveParams {
  key: string;
}

export interface FileUploadResponse extends BaseResponse {
  key: string;
  url: string;
  size: number;
  temp_public_url?: string;
}
