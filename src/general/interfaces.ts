import { BaseResponse } from "../../types";

export interface SentimentResponse extends BaseResponse {
  sentiment: {
    emotion: string;
    sentiment: string;
    score: number;
    sentences: Array<{
      text: string;
      emotion: string;
      sentiment: string;
      score: number;
    }>;
  };
}

export interface TranslateResponse extends BaseResponse {
  translated_text: string;
}

export interface SpeechToTextResponse extends BaseResponse {
  text: string;
  chunks: {
    timestamp: number[];
    text: string;
  }[];
  speakers?: {
    speaker: string;
    timestamp: number[];
    text: string;
  }[];
}

export interface SpeechToTextWebhookResponse extends BaseResponse {
  status: "processing" | "error";
  id: string;
}

export interface TextToSQLResponse extends BaseResponse {
  sql: string;
}

export interface SummaryResponse extends BaseResponse {
  summary: string;
}

export interface PredictionParams {
  dataset: Array<{
    value: number | string;
    date: string;
  }>;

  steps: number;
}

export interface PredictionResponse extends BaseResponse {
  prediction: PredictionParams["dataset"];
}
