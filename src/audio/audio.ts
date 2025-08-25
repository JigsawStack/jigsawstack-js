import { RequestClient } from "../request";
import { SpeechToTextParams, SpeechToTextSyncResponse, SpeechToTextWebhookResponse } from "./interfaces";
class Audio {
  constructor(private readonly client: RequestClient) {}
  // Overload for when webhook_url is provided - returns webhook response
  speech_to_text(params: SpeechToTextParams & { webhook_url: string }): Promise<SpeechToTextWebhookResponse>;
  // Overload for when webhook_url is not provided - returns sync response
  speech_to_text(params: SpeechToTextParams & { webhook_url?: undefined }): Promise<SpeechToTextSyncResponse>;
  // Overload for file upload with webhook_url
  speech_to_text(
    file: Blob | Buffer,
    params: Omit<SpeechToTextParams, "url" | "file_store_key"> & { webhook_url: string }
  ): Promise<SpeechToTextWebhookResponse>;
  // Overload for file upload without webhook_url
  speech_to_text(
    file: Blob | Buffer,
    params?: Omit<SpeechToTextParams, "url" | "file_store_key"> & { webhook_url?: undefined }
  ): Promise<SpeechToTextSyncResponse>;
  // Generic fallback
  speech_to_text(params: SpeechToTextParams): Promise<SpeechToTextSyncResponse>;
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParams, "url" | "file_store_key">): Promise<SpeechToTextSyncResponse>;
  async speech_to_text(
    params: SpeechToTextParams | Blob | Buffer,
    options?: SpeechToTextParams
  ): Promise<SpeechToTextSyncResponse | SpeechToTextWebhookResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      return await this.client.fetchJSS("/ai/transcribe", "POST", params, options);
    }
    return await this.client.fetchJSS("/ai/transcribe", "POST", params);
  }
}

export default Audio;
