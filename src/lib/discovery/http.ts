import { NextResponse } from "next/server";
import type { DiscoveryErrorResponse } from "./contracts";
import { DiscoveryUpstreamError } from "./errors";

export function invalidDiscoveryQueryResponse(message: string): NextResponse<DiscoveryErrorResponse> {
  return NextResponse.json(
    { error: { code: "invalid-query", message } },
    { status: 400, headers: noStoreHeaders() }
  );
}

export function discoveryDisabledResponse(): NextResponse<DiscoveryErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code: "feature-disabled",
        message: "외부 공개 데이터 탐색이 운영상 일시 중지되었습니다."
      }
    },
    { status: 503, headers: noStoreHeaders() }
  );
}

export function discoveryUpstreamErrorResponse(error: unknown): NextResponse<DiscoveryErrorResponse> {
  const upstreamError =
    error instanceof DiscoveryUpstreamError
      ? error
      : new DiscoveryUpstreamError("upstream-unavailable", "외부 데이터 소스에 연결할 수 없습니다.", {
          cause: error
        });
  const status = {
    "rate-limited": 429,
    "upstream-timeout": 504,
    "upstream-unavailable": 503,
    "invalid-upstream-response": 502
  }[upstreamError.code];
  const headers = noStoreHeaders();

  if (upstreamError.retryAfterSeconds !== undefined) {
    headers.set("Retry-After", String(upstreamError.retryAfterSeconds));
  }

  return NextResponse.json(
    {
      error: {
        code: upstreamError.code,
        message: upstreamError.message,
        retryAfterSeconds: upstreamError.retryAfterSeconds
      }
    },
    { status, headers }
  );
}

export function discoverySuccessHeaders(seconds: number): Headers {
  const headers = new Headers();
  headers.set("Cache-Control", `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 24}`);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return headers;
}

function noStoreHeaders(): Headers {
  const headers = new Headers();
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return headers;
}
