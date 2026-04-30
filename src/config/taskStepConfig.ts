export type TaskStepKey =
  | "phoneCheck"
  | "siteCheck"
  | "controlQuestions"
  | "moderationTimer"
  | "reviewReady"
  | "reviewText"
  | "reviewSubmitting"
  | "reviewSubmitted";

export type PlatformStepConfig = {
  steps: TaskStepKey[];
  timerSeconds?: number;
  controlQuestionIds?: string[];
};

export const DEFAULT_PLATFORM_TIMER_SECONDS = 2 * 60;

export const PLATFORM_STEP_CONFIG: Record<string, PlatformStepConfig> = {
  yandex: {
    steps: [
      "phoneCheck",
      "siteCheck",
      "controlQuestions",
      "moderationTimer",
      "reviewReady",
      "reviewText",
      "reviewSubmitting",
      "reviewSubmitted",
    ],
    timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
    controlQuestionIds: ["question1", "question2", "check"],
  },
  "yandex-browser": {
    steps: [
      "controlQuestions",
      "moderationTimer",
      "reviewReady",
      "reviewText",
      "reviewSubmitting",
      "reviewSubmitted",
    ],
    timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
    controlQuestionIds: ["question1", "question2"],
  },
  avito: {
    steps: [],
  },
  google: {
    steps: [],
  },
};

export function getPlatformStepConfig(platform: string): PlatformStepConfig | null {
  return PLATFORM_STEP_CONFIG[platform] ?? null;
}

export function getPlatformSteps(platform: string): TaskStepKey[] {
  return getPlatformStepConfig(platform)?.steps ?? [];
}

export function hasPlatformStep(platform: string, step: TaskStepKey) {
  return getPlatformSteps(platform).includes(step);
}

export function getNextPlatformStep(
  platform: string,
  currentStep: TaskStepKey,
): TaskStepKey | null {
  const steps = getPlatformSteps(platform);
  const index = steps.indexOf(currentStep);

  if (index === -1) {
    return null;
  }

  return steps[index + 1] ?? null;
}

export function getPlatformTimerSeconds(platform: string) {
  return (
    getPlatformStepConfig(platform)?.timerSeconds ??
    DEFAULT_PLATFORM_TIMER_SECONDS
  );
}

export function getPlatformControlQuestionIds(platform: string) {
  return getPlatformStepConfig(platform)?.controlQuestionIds ?? [];
}

