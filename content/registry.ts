import type { RawContentRegistry } from "@/src/lib/content";

import { papers } from "./papers";
import { activeSchedule } from "./schedule";
import { sources } from "./sources";
import { terms } from "./terms";
import { topics } from "./topics";

export const contentRegistry = {
  topics,
  terms,
  papers,
  sources,
  schedule: activeSchedule,
  scheduledTermSlugs: activeSchedule.entries.map((entry) => entry.termSlug)
} satisfies RawContentRegistry;
