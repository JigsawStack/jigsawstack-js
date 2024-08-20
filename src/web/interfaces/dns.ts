export interface DNSParams {
  domain: string;
  type: string;
}

interface DNSRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DNSResponse {
  success: boolean;
  status: number;
  domain: string;
  type: string;
  type_value: number;
  records: DNSRecord[];
  authority: any[];
  additional: any[];
  truncated: boolean;
  recursion_desired: boolean;
  recursion_available: boolean;
  DNSSEC_verified: boolean;
  DNSSEC_validation_disabled: boolean;
}
