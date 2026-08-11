import Link from "next/link";
import type { Route } from "next";
import type { TopicRecord } from "@/src/lib/content";
import { getTopicTone } from "@/src/lib/ui/content";
import { cx } from "@/src/lib/ui/format";
import { topicHref } from "@/src/lib/ui/routes";

interface TopicChipProps {
  topic: TopicRecord;
  href?: Route | null;
  count?: number;
  compact?: boolean;
}

export function TopicChip({ topic, href, count, compact = false }: TopicChipProps) {
  const className = cx("topic-chip", compact && "topic-chip--compact");
  const resolvedHref = href === undefined ? topicHref(topic.slug) : href;
  const content = (
    <>
      <span lang="en">{topic.labelEn}</span>
      <span>{topic.labelKo}</span>
      {typeof count === "number" ? <span className="topic-chip__count">{count}</span> : null}
    </>
  );

  if (!resolvedHref) {
    return (
      <span className={className} data-tone={getTopicTone(topic.slug)}>
        {content}
      </span>
    );
  }

  return (
    <Link className={className} data-tone={getTopicTone(topic.slug)} href={resolvedHref}>
      {content}
    </Link>
  );
}
