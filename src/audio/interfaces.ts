import { BaseResponse } from "../../types";
import { LanguageCodes } from "../utils";

export interface SpeechToTextParams {
  url?: string;
  file_store_key?: string;
  language?: LanguageCodes | "auto";
  translate?: boolean;
  by_speaker?: boolean;
  webhook_url?: string;
  batch_size?: number;
  chunk_duration?: number;
}

export interface SpeechToTextParamsWithWebhook extends SpeechToTextParams {
  webhook_url: string;
}

export interface SpeechToTextParamsWithoutWebhook extends Omit<SpeechToTextParams, "webhook_url"> {
  webhook_url?: never;
}

export interface SpeechToTextResponse extends BaseResponse {
  text: string;
  chunks: Array<{
    timestamp: number[];
    text: string;
  }>;
  speakers?: Array<{
    speaker: string;
    timestamp: number[];
    text: string;
  }>;
}

export interface SpeechToTextWebhookResponse extends BaseResponse {
  status: "processing" | "error";
  id: string;
}
