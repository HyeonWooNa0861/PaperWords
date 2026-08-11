export const MAX_SEARCH_QUERY_LENGTH = 160;

export type NormalizedQueryStatus = "ready" | "empty" | "unsupported" | "oversized";

export interface NormalizedSearchText {
  raw: string;
  value: string;
  compact: string;
  tokens: string[];
  status: NormalizedQueryStatus;
  maxLength: number;
}

const supportedTokenPattern = /[a-z0-9\p{Script=Hangul}]+/gu;

export function normalizeSearchText(
  input: string,
  options: { maxLength?: number; treatOversizedAsReady?: boolean } = {}
): NormalizedSearchText {
  const maxLength = options.maxLength ?? MAX_SEARCH_QUERY_LENGTH;
  const raw = input;

  if (raw.length === 0 || raw.trim().length === 0) {
    return makeNormalized(raw, [], "empty", maxLength);
  }

  if (!options.treatOversizedAsReady && raw.length > maxLength) {
    return makeNormalized(raw, tokenizeSupportedText(raw.slice(0, maxLength)), "oversized", maxLength);
  }

  const tokens = tokenizeSupportedText(raw);
  if (tokens.length === 0) {
    return makeNormalized(raw, [], "unsupported", maxLength);
  }

  return makeNormalized(raw, tokens, "ready", maxLength);
}

export function tokenizeSearchText(input: string): string[] {
  return tokenizeSupportedText(input);
}

export function isSingleLetterAsciiAcronym(tokens: readonly string[]): boolean {
  return tokens.length > 1 && tokens.every((token) => /^[a-z]$/.test(token));
}

function makeNormalized(
  raw: string,
  tokens: string[],
  status: NormalizedQueryStatus,
  maxLength: number
): NormalizedSearchText {
  return {
    raw,
    value: tokens.join(" "),
    compact: tokens.join(""),
    tokens,
    status,
    maxLength
  };
}

function tokenizeSupportedText(input: string): string[] {
  const folded = asciiCaseFold(input.normalize("NFKC"));
  return folded.match(supportedTokenPattern) ?? [];
}

function asciiCaseFold(input: string): string {
  return input.replace(/[A-Z]/g, (character) => character.toLowerCase());
}
