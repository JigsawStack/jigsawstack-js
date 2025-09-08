import { RequestClient } from "../request";
import { ClassificationParams, ClassificationResponse } from "./interfaces";

class Classification {
  private readonly client: RequestClient;
  constructor(client: RequestClient) {
    this.client = client;
  }

  classify = async (params: ClassificationParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/v1/classification", "POST", params);
  };
}

export default Classification;
