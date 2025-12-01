import { BaseResponse } from "../../types";
import { LanguageCodes } from "../utils";

export type TextToSQLParams = {
  prompt: string;
  database?: "postgresql" | "mysql" | "sqlite";
  sql_schema?: string;
  file_store_key?: string;
};

export interface TextToSQLResponse extends BaseResponse {
  sql: string;
}

export interface ImageGenerationParams {
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
}

export interface ImageGenerationResponse extends BaseResponse {
  url: string;
}

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
  translated_text: string | string[];
}

export interface TranslateParams {
  text: string | string[];
  current_language?: LanguageCodes;
  target_language: LanguageCodes;
}

export type TranslateImageParams = {
  url?: string;
  file_store_key?: string;
  target_language: string;
  return_type?: "url" | "binary" | "base64";
};

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

export interface SummaryParams {
  text?: string | null; // maximum 300_000 characters
  url?: string | null; // PDF url only supported
  type?: "text" | "points";
  file_store_key?: string | null;
  max_points?: number | null; // max 100
  max_characters?: number | null;
}

export interface SummaryResponse extends BaseResponse {
  summary: string | string[];
}

export interface PredictionParams {
  dataset: Array<{
    value: number | string;
    date: string;
  }>;
  steps?: number;
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

export interface EmbeddingV2Params {
  text?: string;
  url?: string;
  file_store_key?: string;
  file_content?: any;
  type: "text" | "text-other" | "image" | "audio" | "pdf";
  token_overflow_mode?: "truncate" | "error";
  dimensions?: number;
  instruction?: string;
  query?: boolean;
  speaker_fingerprint?: boolean;
}

export interface EmbeddingV2Response extends BaseResponse {
  embeddings: number[][];
  chunks?:
    | string[]
    | Array<{
        text: string;
        timestamp: number[];
      }>;
  speaker_embeddings?: number[][];
}

export interface EmbeddingResponse extends BaseResponse {
  embeddings: number[][];
  chunks?: Array<{ text: string; timestamp: number[] }>; // only available for text and audio
}
