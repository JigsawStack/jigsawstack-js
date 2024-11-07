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
}

export interface ProfanityParams {
  text: string;
  censor_replacement?: string;
}

export interface ProfanityValidationResponse {
  success: boolean;
  message: string;
  clean_text: string;
  profanities: string[];
  profanities_found: number;
}

export interface SpellCheckParams {
  text: string;
  language_code?: string;
}

export interface SpellCheckValidationResponse {
  success: boolean;
  message: string;
  misspellings_found: number;
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
