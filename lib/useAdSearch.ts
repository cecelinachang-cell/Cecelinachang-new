"use client";

import { useEffect, useSyncExternalStore } from "react";
import { adSearch, rememberAdTags } from "./adTags";

// Nothing to subscribe to: the tags are read once per page view.
const subscribeNever = () => () => {};

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const readAdSearch = () => adSearch(window.location.search, storage());

/** Saves the current URL's ad tags so later pages in the visit keep them. */
export function useRememberAdTags(): void {
  useEffect(() => {
    rememberAdTags(window.location.search, storage());
  }, []);
}

/**
 * Ad tags for checkout links (see lib/adTags). Server render and hydration
 * use "" (plain website links); the browser then adds the tags.
 */
export function useAdSearch(): string {
  useRememberAdTags();
  return useSyncExternalStore(subscribeNever, readAdSearch, () => "");
}
