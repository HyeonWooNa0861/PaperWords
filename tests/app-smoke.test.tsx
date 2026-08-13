import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/AppShell";
import Home from "@/app/page";

const navigationMock = vi.hoisted(() => ({
  pathname: "/"
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname
}));

beforeEach(() => {
  navigationMock.pathname = "/";
});

describe("PaperWords app smoke", () => {
  it("renders product navigation, current-route state, and skip link", () => {
    render(
      <AppShell>
        <main id="main-content">본문</main>
      </AppShell>
    );

    const primaryNavigation = screen.getByRole("navigation", { name: "주요 탐색" });
    const mobileNavigation = document.querySelector(".mobile-nav");
    const pwaSignal = document.querySelector(".pwa-version-signal");

    expect(screen.getByRole("link", { name: "본문으로 바로가기" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("link", { name: "PaperWords 홈" })).toHaveAttribute("href", "/");
    expect(primaryNavigation).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Today" })[0]).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: "Dictionary" })[0]).toHaveAttribute("href", "/dictionary");
    expect(screen.getAllByRole("link", { name: "Topics" })[0]).toHaveAttribute("href", "/topics");
    expect(screen.getAllByRole("link", { name: "Today" })[0]).toHaveAttribute("aria-current", "page");
    expect(mobileNavigation).toBeInTheDocument();
    expect(pwaSignal).toHaveAttribute("data-app-version");
    expect(pwaSignal).toHaveAttribute("data-content-version");
    expect(pwaSignal).toHaveAttribute("data-cache-version");
    expect(document.body).not.toHaveTextContent(/paperwords-mvp|\bMVP\b/i);
  });

  it("marks dictionary as current across the product shell", () => {
    navigationMock.pathname = "/dictionary";

    render(
      <AppShell>
        <main id="main-content">본문</main>
      </AppShell>
    );

    for (const dictionaryLink of screen.getAllByRole("link", { name: /Dictionary|검색/ })) {
      expect(dictionaryLink).toHaveAttribute("href", "/dictionary");
    }
    expect(screen.getAllByRole("link", { name: /Dictionary|검색/ })[0]).toHaveAttribute("aria-current", "page");
  });

  it("renders the Today route with product data dependencies", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByText("오늘의 논문 용어")).toBeInTheDocument();
    expect(screen.getByLabelText("추천 일정 정보")).toHaveTextContent(/기준 날짜|KST 기준일/);
    expect(screen.getByLabelText("추천 일정 정보")).toHaveTextContent(/추천 원칙/);
    expect(screen.getByRole("searchbox", { name: "논문 용어 검색" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘 읽은 개념에서 바로 이어가기" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "집중 탐색 분야" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/paperwords-mvp|\bMVP\b/i);
  });
});
