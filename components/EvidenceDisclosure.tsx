"use client";

import { useEffect, useState, type ReactNode } from "react";

interface EvidenceDisclosureProps {
  title: string;
  meta: string;
  children: ReactNode;
}

export function EvidenceDisclosure({ title, meta, children }: Readonly<EvidenceDisclosureProps>) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const compactQuery = window.matchMedia("(max-width: 920px)");
    const syncToViewport = () => setOpen(!compactQuery.matches);

    syncToViewport();
    compactQuery.addEventListener("change", syncToViewport);

    return () => compactQuery.removeEventListener("change", syncToViewport);
  }, []);

  return (
    <details
      className="evidence-disclosure"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      open={open}
    >
      <summary className="evidence-disclosure__summary">
        <span>{title}</span>
        <span>{meta}</span>
      </summary>
      <div className="evidence-disclosure__content">{children}</div>
    </details>
  );
}
