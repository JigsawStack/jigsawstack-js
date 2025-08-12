import { RequestClient } from "../request";
import { ClassificationParams, ClassificationResponse } from "./interfaces";

class Classification {
  constructor(private readonly client: RequestClient) {}
  classification = async (params: ClassificationParams): Promise<ClassificationResponse> => {
    return await this.client.fetchJSS("/classification", "POST", params);
  };
}

export default Classification;
