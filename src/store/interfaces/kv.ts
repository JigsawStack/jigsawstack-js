import { BaseResponse } from "../../../types";

export interface KVAddParams {
  encrypt?: boolean;
  value: string;
  key: string;
}

export interface KVAddResponse extends BaseResponse {
  url: string;
  key: string;
}
