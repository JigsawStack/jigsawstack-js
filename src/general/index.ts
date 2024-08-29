import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { PredictionParams, PredictionResponse, SentimentResponse, SummaryResponse, TextToSQLResponse, TranslateResponse } from "./interfaces";

class General {
  constructor(private readonly client: RequestClient) {}
  translate = async (params: { current_language: string; target_language: string; text: string }): Promise<TranslateResponse> => {
    return await this.client.fetchJSS("/ai/translate", "POST", params);
  };
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

  summary = async (params: { text: string; type?: "text" | "points" }): Promise<SummaryResponse> => {
    return await this.client.fetchJSS("/ai/summary", "POST", params);
  };
  prediction = async (params: PredictionParams): Promise<PredictionResponse> => {
    return await this.client.fetchJSS("/ai/prediction", "POST", params);
  };
}

export default General;
