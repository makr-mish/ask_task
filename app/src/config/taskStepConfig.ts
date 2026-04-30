export type TaskStepState =
  | "taskReady"
  | "phoneCheck"
  | "phoneChecking"
  | "siteCheck"
  | "siteChecking"
  | "controlQuestions"
  | "moderationTimer"
  | "reviewReady"
  | "reviewText"
  | "reviewSubmitting"
  | "reviewSubmitted";

export type PlatformStepConfig = {
  steps: TaskStepState[];
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

  "yandex-uslugi": {
  steps: [
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

  avito: {
    steps: [],
    timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
    controlQuestionIds: [],
  },

"google-maps": {
  steps: [
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
"vk": {
  steps: [
    "controlQuestions",
    "moderationTimer",
    "reviewReady",
    "reviewText",
    "reviewSubmitting",
    "reviewSubmitted",
  ],
  timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
  controlQuestionIds: ["question1", "check"],
},

flamp: {
  steps: [
    "controlQuestions",
    "moderationTimer",
    "reviewReady",
    "reviewText",
    "reviewSubmitting",
    "reviewSubmitted",
  ],
  timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
  controlQuestionIds: ["check"],
},

zoon: {
  steps: [
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

yell: {
  steps: [
    "moderationTimer",
    "reviewReady",
    "reviewText",
    "reviewSubmitting",
    "reviewSubmitted",
  ],
  timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
  controlQuestionIds: [],
},

twogis: {
  steps: [
    "moderationTimer",
    "reviewReady",
    "reviewText",
    "reviewSubmitting",
    "reviewSubmitted",
  ],
  timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
  controlQuestionIds: [],
},

"dream-job": {
  steps: [
    "controlQuestions",
    "moderationTimer",
    "reviewReady",
    "reviewText",
    "reviewSubmitted",
  ],
  controlQuestionIds: ["question1", "question2", "question3"],
  timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
},

};

export function getPlatformStepConfig(platformKey: string): PlatformStepConfig {
  return PLATFORM_STEP_CONFIG[platformKey] ?? {
    steps: [],
    timerSeconds: DEFAULT_PLATFORM_TIMER_SECONDS,
    controlQuestionIds: [],
  };
}

export function hasPlatformStep(
  platformKey: string,
  step: TaskStepState,
): boolean {
  return getPlatformStepConfig(platformKey).steps.includes(step);
}

export function getNextPlatformStep(
  platformKey: string,
  currentStep: TaskStepState,
): TaskStepState | null {
  const steps = getPlatformStepConfig(platformKey).steps;
  const currentIndex = steps.indexOf(currentStep);

  if (currentIndex === -1) {
    return null;
  }

  return steps[currentIndex + 1] ?? null;
}

export function getPlatformControlQuestionIds(platformKey: string): string[] {
  return getPlatformStepConfig(platformKey).controlQuestionIds ?? [];
}

export function getPlatformTimerSeconds(platformKey: string): number {
  return getPlatformStepConfig(platformKey).timerSeconds ?? DEFAULT_PLATFORM_TIMER_SECONDS;
}
