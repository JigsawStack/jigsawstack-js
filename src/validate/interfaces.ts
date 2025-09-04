import { BaseResponse } from "../../types";
export interface EmailValidationResponse extends BaseResponse {
  email: string;
  disposable: boolean;
  role_account: boolean;
  free: boolean;
  has_mx_records: boolean;
  username: string;
  domain: string;
  valid: boolean;
}

export interface ProfanityParams {
  text: string;
  censor_replacement?: string;
}

export interface ProfanityValidationResponse extends BaseResponse {
  message: string;
  clean_text: string;
  profanities: Array<{
    profanity: string | null;
    startIndex: number;
    endIndex: number;
  }>;
  profanities_found: boolean;
}

export interface SpellCheckParams {
  text: string;
  language_code?: string;
}

export interface SpellCheckValidationResponse extends BaseResponse {
  misspellings_found: boolean;
  misspellings: Array<{
    word: string | null;
    startIndex: number;
    endIndex: number;
    expected: string[];
    auto_corrected: boolean;
  }>;
  auto_correct_text: string;
}

export interface SpamCheckValidationResponse extends BaseResponse {
  check: {
    is_spam: boolean;
    score: number;
  };
}

export interface SpamCheckValidationArrayResponse extends BaseResponse {
  check: Array<{
    is_spam: boolean;
    score: number;
  }>;
}

export interface NSFWParams {
  url?: string;
  file_store_key?: string;
}

export interface NSFWValidationResponse extends BaseResponse {
  nsfw: boolean;
  nudity: boolean;
  gore: boolean;
  nsfw_score: number;
  nudity_score: number;
  gore_score: number;
}
