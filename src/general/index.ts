import { BaseResponse } from "../../types";
import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import {
  PredictionParams,
  PredictionResponse,
  SentimentResponse,
  SummaryParams,
  SummaryResponse,
  TextToSQLResponse,
  TranslateParams,
  TranslateResponse,
} from "./interfaces";

class General {
  private readonly client: RequestClient;
  constructor(client: RequestClient) {
    this.client = client;
    this.summary = this.summary.bind(this);
    this.translate = this.translate.bind(this);
  }

  translate(params: TranslateParams & { text: string[] }): Promise<BaseResponse & { translated_text: string[] }>;
  translate(params: TranslateParams & { text: string }): Promise<TranslateResponse>;

  async translate(params: TranslateParams): Promise<TranslateResponse | (BaseResponse & { translated_text: string[] })> {
    if (Array.isArray(params.text)) {
      const resp = await this.client.fetchJSS("/ai/translate", "POST", params);
      return resp as BaseResponse & { translated_text: string[] };
    }
    return await this.client.fetchJSS("/ai/translate", "POST", params);
  }
  sentiment = async (params: { text: string }): Promise<SentimentResponse> => {
    return await this.client.fetchJSS("/ai/sentiment", "POST", params);
  };

  image_generation = async (params: {
    prompt: string;
    model?: "sd1.5" | "sdxl" | "ead1.0" | "rv1.3" | "rv3" | "rv5.1" | "ar1.8";
    size?: "small" | "medium" | "large";
    width?: number;
    height?: number;
    advance_config?: {
      negative_prompt?: string;
      steps?: number;
      guidance?: string;
      seed?: number;
      scheduler?: "dpmsolver++" | "lms" | "ddim" | "euler" | "euler_a" | "pndm";
    };
  }) => {
    const resp: Response = await this.client.fetchJSS("/ai/image_generation", "POST", params);
    return respToFileChoice(resp);
  };

  text_to_sql = async (params: { prompt: string; sql_schema?: string; file_store_key?: string }): Promise<TextToSQLResponse> => {
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
}

export default General;
