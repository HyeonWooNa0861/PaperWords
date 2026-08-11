import { describe, expect, it } from "vitest";
import { validateDiscoveryQuery } from "@/src/lib/discovery/query";

describe("external discovery query validation", () => {
  it("normalizes supported queries before they reach an upstream source", () => {
    expect(validateDiscoveryQuery(" Neural-Network   Quantization ")).toEqual({
      ok: true,
      value: "neural network quantization"
    });
  });

  it("rejects empty, unsupported, and oversized queries", () => {
    expect(validateDiscoveryQuery(" ")).toMatchObject({ ok: false, status: "empty" });
    expect(validateDiscoveryQuery("東京")).toMatchObject({ ok: false, status: "unsupported" });
    expect(validateDiscoveryQuery("x".repeat(161))).toMatchObject({ ok: false, status: "oversized" });
  });
});
