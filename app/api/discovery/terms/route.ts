import { NextResponse } from "next/server";
import { discoverCsoTerms } from "@/src/lib/discovery/cso";
import { isExternalDiscoveryEnabled } from "@/src/lib/discovery/config";
import {
  discoveryDisabledResponse,
  discoverySuccessHeaders,
  discoveryUpstreamErrorResponse,
  invalidDiscoveryQueryResponse
} from "@/src/lib/discovery/http";
import { validateDiscoveryQuery } from "@/src/lib/discovery/query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isExternalDiscoveryEnabled()) {
    return discoveryDisabledResponse();
  }

  const validation = validateDiscoveryQuery(new URL(request.url).searchParams.get("q") ?? "");
  if (!validation.ok) {
    return invalidDiscoveryQueryResponse(validation.message);
  }

  try {
    const response = await discoverCsoTerms(validation.value);
    return NextResponse.json(response, { headers: discoverySuccessHeaders(60 * 60 * 24) });
  } catch (error) {
    return discoveryUpstreamErrorResponse(error);
  }
}
