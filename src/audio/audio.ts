import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { ListTTSVoiceClonesParams, SpeechToTextParams, SpeechToTextResponse, SpeechToTextSyncResponse, SpeechToTextWebhookResponse, TTSCloneParams, TextToSpeechParams } from "./interfaces";
class Audio {
  constructor(private readonly client: RequestClient) {}
  // Overload for when webhook_url is provided - returns webhook response
  speech_to_text(params: SpeechToTextParams & { webhook_url: string }): Promise<SpeechToTextWebhookResponse>;
  // Overload for when webhook_url is not provided - returns sync response  
  speech_to_text(params: SpeechToTextParams & { webhook_url?: undefined }): Promise<SpeechToTextSyncResponse>;
  // Overload for file upload with webhook_url
  speech_to_text(file: Blob | Buffer, params: Omit<SpeechToTextParams, "url" | "file_store_key"> & { webhook_url: string }): Promise<SpeechToTextWebhookResponse>;
  // Overload for file upload without webhook_url
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParams, "url" | "file_store_key"> & { webhook_url?: undefined }): Promise<SpeechToTextSyncResponse>;
  // Generic fallback
  speech_to_text(params: SpeechToTextParams): Promise<SpeechToTextResponse>;
  speech_to_text(file: Blob | Buffer, params?: Omit<SpeechToTextParams, "url" | "file_store_key">): Promise<SpeechToTextResponse>;
  async speech_to_text(params: SpeechToTextParams | Blob | Buffer, options?: SpeechToTextParams): Promise<SpeechToTextResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      return await this.client.fetchJSS("/ai/transcribe", "POST", params, options);
    }
    return await this.client.fetchJSS("/ai/transcribe", "POST", params);
  }

  text_to_speech = async (params: TextToSpeechParams) => {
    const resp = await this.client.fetchJSS("/ai/tts", "POST", params);
    return respToFileChoice(resp);
  };

  speaker_voice_accents = async () => {
    return await this.client.fetchJSS("/ai/tts", "GET");
  };

  create_clone = async (params: TTSCloneParams) => {
    return await this.client.fetchJSS("/ai/tts/clone", "POST", params);
  };

  list_clones = async (params?: ListTTSVoiceClonesParams) => {
    return await this.client.fetchJSS("/ai/tts/clone", "GET", undefined, params);
  };

  delete_clone = async (voice_id: string) => {
    return await this.client.fetchJSS(`/ai/tts/clone/${voice_id}`, "DELETE");
  };
}

export default Audio;
