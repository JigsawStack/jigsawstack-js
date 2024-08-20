import { RequestClient } from "../request";
import {
  EmailValidationResponse,
  NSFWValidationResponse,
  ProfanityParams,
  ProfanityValidationResponse,
  SpamCheckValidationResponse,
  SpellCheckParams,
  SpellCheckValidationResponse,
} from "./interfaces";

class Validate {
  constructor(private readonly client: RequestClient) {}
  email = async (email: string): Promise<EmailValidationResponse> => {
    return await this.client.fetchJSS(`/validate/email`, "GET", undefined, {
      email,
    });
  };
  nsfw = async (url: string): Promise<NSFWValidationResponse> => {
    return await this.client.fetchJSS(`/validate/nsfw`, "GET", undefined, {
      url,
    });
  };
  profanity = async ({ text, censor_replacement = "*" }: ProfanityParams): Promise<ProfanityValidationResponse> => {
    return await this.client.fetchJSS("/validate/profanity", "GET", {}, { text, censor_replacement });
  };

  spellcheck = async ({ text, language_code = "en" }: SpellCheckParams): Promise<SpellCheckValidationResponse> => {
    return await this.client.fetchJSS("/validate/spell_check", "GET", {}, { text, language_code });
  };

  spamcheck = async (text: string): Promise<SpamCheckValidationResponse> => {
    return await this.client.fetchJSS("/ai/spamcheck", "POST", { text });
  };
}

export default Validate;
