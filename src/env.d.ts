/// <reference path="../.astro/types.d.ts" />
/// <reference path="../worker-configuration.d.ts" />

declare module "*.css";

interface Window {
  RacquetHabitObservability?: {
    setCheckoutAttempt: (attemptId: string) => void;
    captureCheckoutError: (error: unknown, context?: Record<string, string | number | boolean | undefined>) => void;
  };
}

declare var RacquetHabitObservability: Window["RacquetHabitObservability"];
