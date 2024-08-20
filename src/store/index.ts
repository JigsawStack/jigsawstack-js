import { BaseResponse } from "../../types";
import { RequestClient } from "../request";
import { KVAddParams, KVAddResponse } from "./interfaces/kv";
import { File } from "./file";

class KV {
  constructor(private readonly client: RequestClient) {}
  add = async (params: KVAddParams): Promise<KVAddResponse> => {
    return await this.client.fetchJSS(`/store/kv`, "POST", params);
  };
  get = async (key: string): Promise<BaseResponse & { value: string }> => {
    return await this.client.fetchJSS(`/store/kv/${key}`, "GET", {});
  };

  delete = async (key: string): Promise<BaseResponse> => {
    return await this.client.fetchJSS(`/store/kv/${key}`, "DELETE", {});
  };
}

export { KV, File };
