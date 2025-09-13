import { BaseResponse } from "../../types";
import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import { FileUploadParams, FileUploadResponse } from "./interfaces/file";
export class File {
  constructor(private readonly client: RequestClient) {}

  upload = async (file: Blob | Buffer, params?: FileUploadParams): Promise<FileUploadResponse> => {
    const formData = createFileUploadFormData(file, params);

    console.log("FORM DATA HERE", formData);
    return await this.client.fetchJSS(`/v1/store/file`, "POST", formData);
  };

  retrieve = async (key: string) => {
    const resp = await this.client.fetchJSS(`/v1/store/file/read/${key}`, "GET");

    return respToFileChoice(resp);
  };

  delete = async (key: string): Promise<BaseResponse> => {
    return await this.client.fetchJSS(`/v1/store/file/read/${key}`, "DELETE");
  };
}
