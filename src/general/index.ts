import { BaseResponse } from "../../types";
import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import {
  EmbeddingParams,
  EmbeddingResponse,
  EmbeddingV2Params,
  EmbeddingV2Response,
  ImageGenerationParams,
  PredictionParams,
  PredictionResponse,
  SentimentResponse,
  SummaryParams,
  SummaryResponse,
  TextToSQLParams,
  TextToSQLResponse,
  TranslateImageParams,
  TranslateParams,
  TranslateResponse,
} from "./interfaces";

class General {
  private readonly client: RequestClient;
  constructor(client: RequestClient) {
    this.client = client;
    this.summary = this.summary.bind(this);
    this.embedding = this.embedding.bind(this);
    this.embeddingV2 = this.embeddingV2.bind(this);
  }

  translate = {
    text: async (params: TranslateParams): Promise<TranslateResponse | (BaseResponse & { translated_text: string[] })> => {
      if (Array.isArray(params.text)) {
        const resp = await this.client.fetchJSS("/v1/ai/translate", "POST", params);
        return resp as BaseResponse & { translated_text: string[] };
      }
      return await this.client.fetchJSS("/v1/ai/translate", "POST", params);
    },
    image: async (
      params: Blob | Buffer | TranslateImageParams,
      options?: Omit<TranslateImageParams, "file_store_key" | "url">
    ): Promise<ReturnType<typeof respToFileChoice>> => {
      if (params instanceof Blob || params instanceof Buffer) {
        const formData = createFileUploadFormData(params, options);
        const resp = await this.client.fetchJSS("/v1/ai/translate/image", "POST", formData);
        return respToFileChoice(resp);
      }
      const resp = await this.client.fetchJSS("/v1/ai/translate/image", "POST", params);
      return respToFileChoice(resp);
    },
  };

  sentiment = async (params: { text: string }): Promise<SentimentResponse> => {
    return await this.client.fetchJSS("/v1/ai/sentiment", "POST", params);
  };

  image_generation = async (params: ImageGenerationParams) => {
    const resp = await this.client.fetchJSS("/v1/ai/image_generation", "POST", params);
    return respToFileChoice(resp);
  };

  text_to_sql = async (params: TextToSQLParams): Promise<TextToSQLResponse> => {
    return await this.client.fetchJSS("/v1/ai/sql", "POST", params);
  };

  summary(params: SummaryParams & { type: "points" }): Promise<BaseResponse & { summary: string[] }>;
  summary(params: SummaryParams & { type: "text" }): Promise<BaseResponse & { summary: string }>;
  async summary(params: SummaryParams): Promise<(BaseResponse & { summary: string[] }) | (BaseResponse & { summary: string })> {
    if (params.type === "points") {
      const resp = await this.client.fetchJSS("/v1/ai/summary", "POST", params);
      return resp as BaseResponse & { summary: string[] };
    }
    return await this.client.fetchJSS("/v1/ai/summary", "POST", params);
  }

  prediction = async (params: PredictionParams): Promise<PredictionResponse> => {
    return await this.client.fetchJSS("/v1/ai/prediction", "POST", params);
  };

  embedding(params: EmbeddingParams): Promise<EmbeddingResponse>;
  embedding(file: Blob | Buffer, params: Omit<EmbeddingParams, "url" | "file_store_key" | "file_content">): Promise<EmbeddingResponse>;
  async embedding(params: EmbeddingParams | Blob | Buffer, options?: EmbeddingParams): Promise<EmbeddingResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/v1/embedding", "POST", formData);
    }
    return await this.client.fetchJSS("/v1/embedding", "POST", params);
  }

  embeddingV2(params: EmbeddingV2Params): Promise<EmbeddingV2Response>;
  embeddingV2(file: Blob | Buffer, params: Omit<EmbeddingV2Params, "url" | "file_store_key" | "file_content">): Promise<EmbeddingV2Response>;
  async embeddingV2(params: EmbeddingV2Params | Blob | Buffer, options?: EmbeddingV2Params): Promise<EmbeddingV2Response> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/v2/embedding", "POST", formData);
    }
    return await this.client.fetchJSS("/v2/embedding", "POST", params);
  }
}

export default General;
