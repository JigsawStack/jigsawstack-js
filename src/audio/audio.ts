import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import { SpeechToTextParams, SpeechToTextSyncResponse, SpeechToTextWebhookResponse } from "./interfaces";
class Audio {
  constructor(private readonly client: RequestClient) {}
  speech_to_text(params: SpeechToTextParams): Promise<SpeechToTextSyncResponse>;
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParams, "url" | "file_store_key">): Promise<SpeechToTextSyncResponse>;
  async speech_to_text(
    params: SpeechToTextParams | Blob | Buffer,
    options?: SpeechToTextParams
  ): Promise<SpeechToTextSyncResponse | SpeechToTextWebhookResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/v1/ai/transcribe", "POST", formData);
    }
    return await this.client.fetchJSS("/v1/ai/transcribe", "POST", params);
  }
}

export default Audio;
