import type { Route } from "next";

export const homeHref = "/" as Route;
export const dictionaryHref = "/dictionary" as Route;
export const topicsHref = "/topics" as Route;

export function termHref(slug: string): Route {
  return `/terms/${slug}` as Route;
}

export function topicHref(slug: string): Route {
  return `/topics/${slug}` as Route;
}

export function paperHref(id: string): Route {
  return `/papers/${id}` as Route;
}
