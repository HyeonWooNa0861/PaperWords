export const EXTERNAL_VERIFICATION_STATUS = "external-unverified" as const;

export interface DiscoverySource {
  id: "cso" | "crossref";
  name: string;
  url: string;
  licenseNote: string;
}

export interface CsoTermCandidate {
  label: string;
  url: string;
  verificationStatus: typeof EXTERNAL_VERIFICATION_STATUS;
}

export interface CrossrefPaperCandidate {
  doi: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  type?: string;
  citedByCount?: number;
  url: string;
  verificationStatus: typeof EXTERNAL_VERIFICATION_STATUS;
}

export interface CsoDiscoveryResponse {
  query: string;
  source: DiscoverySource;
  candidates: CsoTermCandidate[];
}

export interface CrossrefDiscoveryResponse {
  query: string;
  source: DiscoverySource;
  candidates: CrossrefPaperCandidate[];
}

export type DiscoveryErrorCode =
  | "invalid-query"
  | "feature-disabled"
  | "rate-limited"
  | "upstream-timeout"
  | "upstream-unavailable"
  | "invalid-upstream-response";

export interface DiscoveryErrorResponse {
  error: {
    code: DiscoveryErrorCode;
    message: string;
    retryAfterSeconds?: number;
  };
}
