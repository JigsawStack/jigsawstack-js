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
    speaker?: string;
  }>;
  language_detected?: {
    code?: string;
    confidence?: number;
  }; // only available if language is auto
}

export interface SpeechToTextWebhookResponse extends BaseResponse {
  status: "processing" | "error";
  id: string;
}

export interface LiveSTTConfig {
  language?: LanguageCodes | "auto";
  sampleRate?: number;
  channels?: 1 | 2;
  translate?: boolean;
  chunkSeconds?: number;
  overlapSeconds?: number;
  vadThreshold?: number;
  maxBufferSeconds?: number;
}

export interface LiveSTTDelta {
  text: string;
  chunkIndex: number;
}

export interface LiveSTTTurn {
  text: string;
  chunkIndex: number;
  isFinal: boolean;
}

export interface LiveSTTWarning {
  code: "buffer_overflow" | "chunk_error";
  message: string;
}

export interface LiveSTTEvents {
  open: (payload: { id: string }) => void;
  delta: (payload: LiveSTTDelta) => void;
  turn: (payload: LiveSTTTurn) => void;
  warning: (payload: LiveSTTWarning) => void;
  error: (err: Error) => void;
  close: () => void;
}

export interface LiveTranscriber {
  on<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  off<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  connect(): Promise<void>;
  stream(): WritableStream<Uint8Array>;
  close(): Promise<void>;
}
