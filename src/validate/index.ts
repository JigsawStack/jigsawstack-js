import { RequestClient } from "../request";
import { createFileUploadFormData } from "../utils";
import {
  NSFWParams,
  NSFWValidationResponse,
  ProfanityParams,
  ProfanityValidationResponse,
  SpamCheckValidationArrayResponse,
  SpamCheckValidationResponse,
  SpellCheckParams,
  SpellCheckValidationResponse,
} from "./interfaces";

class Validate {
  constructor(private readonly client: RequestClient) {}

  nsfw(params: NSFWParams): Promise<NSFWValidationResponse>;
  nsfw(file: Blob | Buffer, params?: Omit<NSFWParams, "url" | "file_store_key">): Promise<NSFWValidationResponse>;
  async nsfw(params: NSFWParams | Blob | Buffer, options?: NSFWParams): Promise<NSFWValidationResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/validate/nsfw", "POST", formData);
    }
    return await this.client.fetchJSS("/validate/nsfw", "POST", params);
  }

  profanity = async ({ text, censor_replacement = "*" }: ProfanityParams): Promise<ProfanityValidationResponse> => {
    return await this.client.fetchJSS("/validate/profanity", "POST", { text, censor_replacement });
  };

  spellcheck = async ({ text, language_code = "en" }: SpellCheckParams): Promise<SpellCheckValidationResponse> => {
    return await this.client.fetchJSS("/validate/spell_check", "POST", { text, language_code });
  };

  spamcheck({ text }: { text: string }): Promise<SpamCheckValidationResponse>;
  spamcheck({ text }: { text: string[] }): Promise<SpamCheckValidationArrayResponse>;
  async spamcheck({ text }: { text: string | string[] }): Promise<SpamCheckValidationResponse | SpamCheckValidationArrayResponse> {
    return await this.client.fetchJSS("/validate/spam_check", "POST", { text });
  }
}

export default Validate;
