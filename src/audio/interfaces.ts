import { BaseResponse } from "../../types";

export interface SpeechToTextParams {
  url?: string;
  file_store_key?: string;
  language?: string;
  translate?: boolean;
  by_speaker?: boolean;
  webhook_url?: string;
  batch_size?: number;
  chunk_duration?: number;
}

export interface SpeechToTextResponse extends BaseResponse {
  text: string;
  chunks: Array<{
    timestamp: number[];
    text: string;
  }>;
  status?: "processing" | "error";
  id?: string;
  speakers?: {
    //  available when by_speaker is true
    speaker: string;
    timestamp: number[];
    text: string;
  }[];
}

export interface SpeechToTextWebhookResponse extends BaseResponse {
  status: "processing" | "error";
  id: string;
}
