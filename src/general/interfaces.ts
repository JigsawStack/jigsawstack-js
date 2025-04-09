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

export interface TranslateParams {
  current_language?: string;
  target_language: string;
  text: string | string[];
}

export interface TranslateImageParams {
  target_language: string;
  url?: string;
  file_store_key?: string;
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

export interface SummaryParams {
  text?: string; // maximum 300_000 characters
  type?: "text" | "points";
  url?: string; // PDF url only supported
  file_store_key?: string;
  max_points?: number; // max 100
  max_characters?: number;
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

export interface EmbeddingParams {
  text?: string;
  url?: string;
  file_store_key?: string;
  file_content?: any;
  type: "text" | "text-other" | "image" | "audio" | "pdf";
  token_overflow_mode?: "truncate" | "error";
}

export interface EmbeddingResponse extends BaseResponse {
  embeddings: number[];
  chunks: string[]; // only for text
}
