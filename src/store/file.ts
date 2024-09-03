import { BaseResponse } from "../../types";
import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { FileUploadParams, FileUploadResponse } from "./interfaces/file";
export class File {
  constructor(private readonly client: RequestClient) {}
  upload = async (file: Blob | Buffer, params: FileUploadParams): Promise<FileUploadResponse> => {
    return await this.client.fetchJSS(
      `/store/file`,
      "POST",
      file,
      {
        key: params.filename,
        overwrite: params.overwrite,
      },
      params?.content_type && {
        "Content-Type": params.content_type,
      }
    );
  };
  retrieve = async (key: string) => {
    const resp = await this.client.fetchJSS(`/store/file/${key}`, "GET", {});
    return respToFileChoice(resp);
  };

  delete = async (key: string): Promise<BaseResponse> => {
    return await this.client.fetchJSS(`/store/file/${key}`, "DELETE", {});
  };
}
