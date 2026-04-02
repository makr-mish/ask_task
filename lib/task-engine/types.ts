import type { PlatformConfig } from "@/lib/platforms";
import type { TaskStepState } from "@/app/src/config/taskStepConfig";

export type YesNoAnswer = "Да" | "Нет" | null;

export type AppUser = {
  USER_ID_TEXT: string;
  first_name?: string;
  username?: string;
};

export type EngineStepState =
  | "form"
  | "loadingTask"
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

export type TaskContext = {
  platform: PlatformConfig;
  user: AppUser | null;
  accountName: string;
  gender: string;
  region: string;
  regionError: string;
  loading: boolean;
  stepState: EngineStepState | TaskStepState;
  modalMessage: string;
  isModalOpen: boolean;
  resetMessage: string;
  feedbackId: string | null;
  fbId: string | null;
  siteId: string | null;
  taskText: string;
  timerSeconds: number;
  reviewText: string;
  submitResultId: string | null;
  phoneFileName: string;
  phoneReason: string;
  siteValue: string;
  questionsLoading: boolean;
  questionTexts: Record<string, string>;
  questionAnswers: Record<string, YesNoAnswer>;
};

export type PlatformAdapter = {
  platformSlug: string;
  getPreviewImages: () => {
    phoneExampleImage?: string;
    siteExampleImage?: string;
    regionHelpImage?: string;
  };
  getRewardText: (platform: PlatformConfig) => string;
  getReviewStatusLabel?: () => string;
};