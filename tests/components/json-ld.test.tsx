import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JsonLd } from "@/components/JsonLd";

afterEach(() => {
  cleanup();
});

describe("JsonLd", () => {
  it("escapes malicious script delimiters in serialized JSON-LD", () => {
    render(
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: "<script>alert(1)</script>"
        }}
      />
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    const serialized = script?.innerHTML ?? "";

    expect(script).not.toBeNull();
    expect(serialized).toContain("\\u003cscript>alert(1)\\u003c/script>");
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain("<script>");
    expect(serialized).not.toContain("</script>");
  });
});
