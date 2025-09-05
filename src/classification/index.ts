import { RequestClient } from "../request";
import { ClassificationImageParams, ClassificationResponse, ClassificationTextParams } from "./interfaces";

class Classification {
  private readonly client: RequestClient;
  constructor(client: RequestClient) {
    this.client = client;
  }

  text = async (params: ClassificationTextParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/v1/classification", "POST", params);
  };

  image = async (params: ClassificationImageParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/v1/classification", "POST", params);
  };
}

export default Classification;
