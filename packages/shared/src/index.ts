/**
 * @process/shared — types, zod schemas, and constants shared by the Expo app and the API.
 * Built to CommonJS (dist/) so both Nest (require) and Metro can consume it.
 */

export const APP_NAME = "Process";

/** The app's guiding philosophy, shown on the Home screen. */
export const PHILOSOPHY = "Real change happens only by following the process daily.";

export * from "./enums";
export * from "./rules";
export * from "./weight";
export * from "./profile";
export * from "./meals";
