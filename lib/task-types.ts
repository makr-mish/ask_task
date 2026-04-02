export type StepState =
  | "form"
  | "loadingTask"
  | "taskReady"
  | "phoneCheck"
  | "phoneChecking"
  | "siteCheck"
  | "siteChecking"
  | "controlQuestions"
  | "moderationTimer"
  | "reviewText"
  | "submittingReview"
  | "done"
  | "error";

export type YesNoAnswer = "Да" | "Нет" | null;

export type ControlQuestionItem = {
  id: number;
  text: string;
  answer: YesNoAnswer;
};