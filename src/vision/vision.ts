import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import { ObjectDetectionParams, ObjectDetectionResponse, VOCRParams, VOCRResponse } from "./interfaces";
class Vision {
  constructor(private readonly client: RequestClient) {}

  vocr(params: VOCRParams): Promise<VOCRResponse>;
  vocr(file: Blob | Buffer, params?: Omit<VOCRParams, "url" | "file_store_key">): Promise<VOCRResponse>;
  async vocr(params: VOCRParams | Blob | Buffer, options?: VOCRParams): Promise<VOCRResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/vocr", "POST", formData);
    }
    return await this.client.fetchJSS("/vocr", "POST", params);
  }

  object_detection(params: ObjectDetectionParams): Promise<ObjectDetectionResponse>;
  object_detection(file: Blob | Buffer, params?: Omit<ObjectDetectionParams, "url" | "file_store_key">): Promise<ObjectDetectionResponse>;
  async object_detection(params: ObjectDetectionParams | Blob | Buffer, options?: ObjectDetectionParams): Promise<ObjectDetectionResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      console.log(formData);
      return await this.client.fetchJSS("/object_detection", "POST", formData);
    }
    return await this.client.fetchJSS("/object_detection", "POST", params);
  }
}

export default Vision;
