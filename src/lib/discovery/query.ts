import { normalizeSearchText, type NormalizedQueryStatus } from "@/src/lib/search";

export type DiscoveryQueryResult =
  | {
      ok: true;
      value: string;
    }
  | {
      ok: false;
      status: Exclude<NormalizedQueryStatus, "ready">;
      message: string;
    };

export function validateDiscoveryQuery(rawQuery: string): DiscoveryQueryResult {
  const normalized = normalizeSearchText(rawQuery);

  switch (normalized.status) {
    case "ready":
      return { ok: true, value: normalized.value };
    case "empty":
      return { ok: false, status: "empty", message: "외부 검색어를 입력해 주세요." };
    case "unsupported":
      return {
        ok: false,
        status: "unsupported",
        message: "외부 검색은 영어, 숫자, 한글 토큰만 지원합니다."
      };
    case "oversized":
      return {
        ok: false,
        status: "oversized",
        message: `외부 검색어는 ${normalized.maxLength}자 이하로 입력해 주세요.`
      };
  }
}
