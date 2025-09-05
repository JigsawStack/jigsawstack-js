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
  constructor(private readonly client: RequestClient) {
    this.spamcheck = this.spamcheck.bind(this);
  }

  nsfw(params: NSFWParams): Promise<NSFWValidationResponse>;
  nsfw(file: Blob | Buffer, params?: Omit<NSFWParams, "url" | "file_store_key">): Promise<NSFWValidationResponse>;
  async nsfw(params: NSFWParams | Blob | Buffer, options?: NSFWParams): Promise<NSFWValidationResponse> {
    if (params instanceof Blob || params instanceof Buffer) {
      const formData = createFileUploadFormData(params, options);
      return await this.client.fetchJSS("/v1/validate/nsfw", "POST", formData);
    }
    return await this.client.fetchJSS("/v1/validate/nsfw", "POST", params);
  }

  profanity = async ({ text, censor_replacement = "*" }: ProfanityParams): Promise<ProfanityValidationResponse> => {
    return await this.client.fetchJSS("/v1/validate/profanity", "POST", { text, censor_replacement });
  };

  spellcheck = async ({ text, language_code = "en" }: SpellCheckParams): Promise<SpellCheckValidationResponse> => {
    return await this.client.fetchJSS("/v1/validate/spell_check", "POST", { text, language_code });
  };

  spamcheck(text: string): Promise<SpamCheckValidationResponse>;
  spamcheck(text: string[]): Promise<SpamCheckValidationArrayResponse>;
  async spamcheck(text: string | string[]): Promise<SpamCheckValidationResponse | SpamCheckValidationArrayResponse> {
    return await this.client.fetchJSS("/v1/validate/spam_check", "POST", { text });
  }
}

export default Validate;
