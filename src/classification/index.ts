import { RequestClient } from "../request";
import { ClassificationTextParams, ClassificationImageParams, ClassificationResponse } from "./interfaces";

class Classification {
  private readonly client: RequestClient;
  constructor(client: RequestClient) {
    this.client = client;
  }

  text = async (params: ClassificationTextParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/classification", "POST", params);
  };

  image = async (params: ClassificationImageParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/classification", "POST", params);
  };
}

export default Classification;
