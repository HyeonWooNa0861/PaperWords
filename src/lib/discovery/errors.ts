import type { DiscoveryErrorCode } from "./contracts";

type DiscoveryUpstreamErrorCode = Exclude<
  DiscoveryErrorCode,
  "invalid-query" | "feature-disabled"
>;

export class DiscoveryUpstreamError extends Error {
  readonly code: DiscoveryUpstreamErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(
    code: DiscoveryUpstreamErrorCode,
    message: string,
    options: { cause?: unknown; retryAfterSeconds?: number } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "DiscoveryUpstreamError";
    this.code = code;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}
