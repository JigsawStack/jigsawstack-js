import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import { SpeechToTextParams, SpeechToTextResponse } from "./interfaces";
class Audio {
  constructor(private readonly client: RequestClient) {}
  speech_to_text(params: SpeechToTextParams): Promise<SpeechToTextResponse>;
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParams, "url" | "file_store_key">): Promise<SpeechToTextResponse>;
  async speech_to_text(params: SpeechToTextParams | Blob | Buffer, options?: SpeechToTextParams): Promise<SpeechToTextResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/ai/transcribe", "POST", formData);
    }
    return await this.client.fetchJSS("/ai/transcribe", "POST", params);
  }
}

export default Audio;
