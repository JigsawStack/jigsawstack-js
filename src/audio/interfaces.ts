import { BaseResponse } from "../../types";

export interface SpeechToTextParams {
  url?: string;
  file_store_key?: string;
  language?: string;
  translate?: boolean;
  by_speaker?: boolean;
  webhook_url?: string;
}

export interface SpeechToTextResponse {
  success: boolean;
  text: string;
  chunks: Array<{
    timestamp: number[];
    text: string;
  }>;
}

export interface SpeechToTextWebhookResponse extends BaseResponse {
  status: "processing" | "error";
  id: string;
}

export interface TextToSpeechParams {
  text: string;
  accent?: string;
  speaker_clone_url?: string;
  speaker_clone_file_store_key?: string;
}

export interface TextToSpeechResponse {
  status: "processing" | "error";
  id: string;
}
