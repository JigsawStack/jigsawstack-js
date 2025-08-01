export interface EmailValidationResponse {
  email: string;
  disposable: boolean;
  role_account: boolean;
  free: boolean;
  has_mx_records: boolean;
  username: string;
  domain: string;
  valid: boolean;
}

export interface NSFWValidationResponse {
  success: boolean;
  nsfw: boolean;
  nudity: boolean;
  gore: boolean;
  nsfw_score: number;
  nudity_score: number;
  gore_score: number;
}

export interface ProfanityParams {
  text: string;
  censor_replacement?: string;
}

export interface ProfanityValidationResponse {
  success: boolean;
  message: string;
  clean_text: string;
  profanities: {
    profanity: string;
    startIndex: number;
    endIndex: number;
  }[];
  profanities_found: boolean;
}

export interface SpellCheckParams {
  text: string;
  language_code?: string;
}

export interface SpellCheckValidationResponse {
  success: boolean;
  misspellings_found: boolean;
  misspellings: Array<{
    word: string;
    startIndex: number;
    endIndex: number;
    expected: string[];
    auto_corrected: boolean;
  }>;
  auto_correct_text: string;
}

export interface SpamCheckValidationResponse {
  success: boolean;
  check: {
    is_spam: boolean;
    score: number;
  };
}

export interface SpamCheckValidationArrayResponse {
  success: boolean;
  check: {
    is_spam: boolean;
    score: number;
  }[];
}

export interface NSFWParams {
  url?: string;
  file_store_key?: string;
}
