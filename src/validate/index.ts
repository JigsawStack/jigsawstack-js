import { RequestClient } from "../request";
import {
  EmailValidationResponse,
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

  nsfw(params: NSFWParams | Blob | Buffer): Promise<NSFWValidationResponse> {
    return this.client.fetchJSS("/validate/nsfw", "POST", params);
  }

  profanity = async ({ text, censor_replacement = "*" }: ProfanityParams): Promise<ProfanityValidationResponse> => {
    return await this.client.fetchJSS("/validate/profanity", "POST", { text, censor_replacement });
  };

  spellcheck = async ({ text, language_code = "en" }: SpellCheckParams): Promise<SpellCheckValidationResponse> => {
    return await this.client.fetchJSS("/validate/spell_check", "POST", { text, language_code });
  };

  spamcheck(text: string): Promise<SpamCheckValidationResponse>;
  spamcheck(text: string[]): Promise<SpamCheckValidationArrayResponse>;
  async spamcheck(text: string | string[]): Promise<SpamCheckValidationResponse | SpamCheckValidationArrayResponse> {
    return await this.client.fetchJSS("/validate/spam_check", "POST", { text });
  }
}

export default Validate;
