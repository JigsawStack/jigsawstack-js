import { RequestClient } from "../request";
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
      return await this.client.fetchJSS("/ai/transcribe", "POST", params, options);
    }
    return await this.client.fetchJSS("/ai/transcribe", "POST", params);
  }
}

export default Audio;
