import { APP_NAME, PHILOSOPHY } from "@process/shared";

/** App-level constants sourced from the shared package (single source of truth). */
export const appMeta = {
  name: APP_NAME,
  philosophy: PHILOSOPHY,
} as const;
