"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dictionaryHref, homeHref, topicsHref } from "@/src/lib/ui/routes";

type ProductArea = "today" | "dictionary" | "topics";

interface NavigationItem {
  area: ProductArea;
  href: Route;
  labelDesktop: string;
  labelMobile: string;
}

const navigationItems: readonly NavigationItem[] = [
  {
    area: "today",
    href: homeHref,
    labelDesktop: "Today",
    labelMobile: "오늘"
  },
  {
    area: "dictionary",
    href: dictionaryHref,
    labelDesktop: "Dictionary",
    labelMobile: "검색"
  },
  {
    area: "topics",
    href: topicsHref,
    labelDesktop: "Topics",
    labelMobile: "주제"
  }
] as const;

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="주요 탐색">
      {navigationItems.map((item) => (
        <Link
          aria-current={isActiveArea(pathname, item.area) ? "page" : undefined}
          href={item.href}
          key={item.area}
        >
          {item.labelDesktop}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="모바일 주요 탐색">
      <div className="mobile-nav__inner">
        {navigationItems.map((item) => (
          <Link
            aria-current={isActiveArea(pathname, item.area) ? "page" : undefined}
            href={item.href}
            key={item.area}
          >
            <NavigationIcon area={item.area} />
            <span>{item.labelMobile}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function isActiveArea(pathname: string, area: ProductArea): boolean {
  switch (area) {
    case "today":
      return pathname === "/";
    case "dictionary":
      return pathname === "/dictionary" || pathname.startsWith("/terms/") || pathname.startsWith("/papers/");
    case "topics":
      return pathname === "/topics" || pathname.startsWith("/topics/");
  }
}

function NavigationIcon({ area }: Readonly<{ area: ProductArea }>) {
  if (area === "today") {
    return (
      <svg aria-hidden="true" className="mobile-nav__icon" viewBox="0 0 24 24">
        <path d="M5.5 4.5h13v15h-13z" />
        <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
      </svg>
    );
  }

  if (area === "dictionary") {
    return (
      <svg aria-hidden="true" className="mobile-nav__icon" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4.5 4.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="mobile-nav__icon" viewBox="0 0 24 24">
      <path d="M5 5h5.5v5.5H5zM13.5 5H19v5.5h-5.5zM5 13.5h5.5V19H5zM13.5 13.5H19V19h-5.5z" />
    </svg>
  );
}
