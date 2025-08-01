import { BaseResponse } from "../../types";
import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import {
  EmbeddingParams,
  EmbeddingResponse,
  PredictionParams,
  PredictionResponse,
  SentimentResponse,
  SummaryParams,
  SummaryResponse,
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
  }

  translate = {
    text: async (params: TranslateParams): Promise<TranslateResponse | (BaseResponse & { translated_text: string[] })> => {
      if (Array.isArray(params.text)) {
        const resp = await this.client.fetchJSS("/ai/translate", "POST", params);
        return resp as BaseResponse & { translated_text: string[] };
      }
      return await this.client.fetchJSS("/ai/translate", "POST", params);
    },
    image: async (
      params: Blob | Buffer | TranslateImageParams,
      options?: Omit<TranslateImageParams, "file_store_key" | "url">
    ): Promise<ReturnType<typeof respToFileChoice>> => {
      if (params instanceof Blob || params instanceof Buffer) {
        const resp = await this.client.fetchJSS("/ai/translate/image", "POST", params, options);
        return respToFileChoice(resp);
      }
      const resp = await this.client.fetchJSS("/ai/translate/image", "POST", params);
      return respToFileChoice(resp);
    },
  };

  sentiment = async (params: { text: string }): Promise<SentimentResponse> => {
    return await this.client.fetchJSS("/ai/sentiment", "POST", params);
  };

  image_generation = async (params: {
    prompt: string;
    aspect_ratio?: "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21";
    width?: number;
    height?: number;
    steps?: number;
    output_format?: "png" | "svg";
    return_type?: "url" | "binary" | "base64";
    advance_config?: {
      negative_prompt?: string;
      guidance?: number;
      seed?: number;
    };
    url?: string;
    file_store_key?: string;
  }) => {
    const resp = await this.client.fetchJSS("/ai/image_generation", "POST", params);

    return respToFileChoice(resp);
  };

  text_to_sql = async (params: {
    prompt: string;
    sql_schema?: string;
    file_store_key?: string;
    database?: "postgresql" | "mysql" | "sqlite";
  }): Promise<TextToSQLResponse> => {
    return await this.client.fetchJSS("/ai/sql", "POST", params);
  };

  summary(params: SummaryParams & { type: "points" }): Promise<BaseResponse & { summary: string[] }>;
  summary(params: SummaryParams & { type: "text" }): Promise<SummaryResponse>;
  async summary(params: SummaryParams): Promise<SummaryResponse | (BaseResponse & { summary: string[] })> {
    if (params.type === "points") {
      const resp = await this.client.fetchJSS("/ai/summary", "POST", params);
      return resp as BaseResponse & { summary: string[] };
    }
    return await this.client.fetchJSS("/ai/summary", "POST", params);
  }

  prediction = async (params: PredictionParams): Promise<PredictionResponse> => {
    return await this.client.fetchJSS("/ai/prediction", "POST", params);
  };

  embedding(params: EmbeddingParams): Promise<EmbeddingResponse>;
  embedding(file: Blob | Buffer, params: Omit<EmbeddingParams, "url" | "file_store_key" | "file_content">): Promise<EmbeddingResponse>;
  async embedding(params: EmbeddingParams | Blob | Buffer, options?: EmbeddingParams): Promise<EmbeddingResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      return await this.client.fetchJSS("/embedding", "POST", params, options);
    }
    return await this.client.fetchJSS("/embedding", "POST", params);
  }
}

export default General;
