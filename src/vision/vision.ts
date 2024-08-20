import { RequestClient } from "../request";
import { ObjectDetectionResponse, ObjectDetentionParams, VOCRParams, VOCRResponse } from "./interfaces";
class Vision {
  constructor(private readonly client: RequestClient) {}
  vocr = async (params: VOCRParams): Promise<VOCRResponse> => {
    return await this.client.fetchJSS("/vocr", "POST", params);
  };
  object_detection = async (params: ObjectDetentionParams): Promise<ObjectDetectionResponse> => {
    return await this.client.fetchJSS("/ai/object_detection", "POST", params);
  };
}

export default Vision;
