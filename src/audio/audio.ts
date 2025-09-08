import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import {
  SpeechToTextParams,
  SpeechToTextParamsWithWebhook,
  SpeechToTextParamsWithoutWebhook,
  SpeechToTextResponse,
  SpeechToTextWebhookResponse,
} from "./interfaces";

class Audio {
  constructor(private readonly client: RequestClient) {}

  // Overload for webhook case
  speech_to_text(params: SpeechToTextParamsWithWebhook): Promise<SpeechToTextWebhookResponse>;

  // Overload for Blob/Buffer with webhook
  speech_to_text(file: Blob | Buffer, params: Omit<SpeechToTextParamsWithWebhook, "url" | "file_store_key">): Promise<SpeechToTextWebhookResponse>;

  // Overload for non-webhook case
  speech_to_text(params: SpeechToTextParamsWithoutWebhook): Promise<SpeechToTextResponse>;

  // Overload for Blob/Buffer without webhook
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParamsWithoutWebhook, "url" | "file_store_key">): Promise<SpeechToTextResponse>;

  // Implementation
  async speech_to_text(
    params: SpeechToTextParams | Blob | Buffer,
    options?: SpeechToTextParams
  ): Promise<SpeechToTextResponse | SpeechToTextWebhookResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/v1/ai/transcribe", "POST", formData);
    }
    return await this.client.fetchJSS("/v1/ai/transcribe", "POST", params);
  }
}

export default Audio;
