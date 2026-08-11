import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/AppShell";
import Home from "@/app/page";

describe("PaperWords app smoke", () => {
  it("renders the app shell navigation and skip link", () => {
    render(
      <AppShell>
        <main id="main-content">본문</main>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "본문으로 바로가기" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("link", { name: "PaperWords 홈" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "주요 탐색" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dictionary" })).toHaveAttribute("href", "/dictionary");
    expect(screen.getByRole("link", { name: "Topics" })).toHaveAttribute("href", "/topics");
  });

  it("renders the Today route with product data dependencies", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByText("오늘의 논문 용어")).toBeInTheDocument();
    expect(screen.getByText("paperwords-mvp-2026-08-11.v1")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "논문 용어 검색" })).toBeInTheDocument();
  });
});
