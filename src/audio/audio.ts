import { respToFileChoice } from "../helpers";
import { RequestClient } from "../request";
import { SpeechToTextParams, SpeechToTextResponse, TextToSpeechParams } from "./interfaces";
class Audio {
  constructor(private readonly client: RequestClient) {}
  speech_to_text = async (params: SpeechToTextParams): Promise<SpeechToTextResponse> => {
    return await this.client.fetchJSS("/ai/transcribe", "POST", params);
  };
  text_to_speech = async (params: TextToSpeechParams) => {
    const resp = await this.client.fetchJSS("/ai/tts", "POST", params);
    return respToFileChoice(resp);
  };
  speaker_voice_accents = async () => {
    return await this.client.fetchJSS("/ai/tts", "GET", undefined);
  };
}

export default Audio;
