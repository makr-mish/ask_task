"use client";

type YesNoAnswer = "Да" | "Нет" | null;

type ControlQuestionCardProps = {
  number: number;
  title?: string;
  text: string;
  answer: YesNoAnswer;
  onAnswer: (value: YesNoAnswer) => void;
};

export default function ControlQuestionCard({
  number,
  title,
  text,
  answer,
  onAnswer,
}: ControlQuestionCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5">
      <div className="text-lg font-semibold text-black">Вопрос {number}</div>

      {title && (
        <div className="mt-3 text-base font-semibold text-black">{title}</div>
      )}

      <div className="mt-3 text-sm leading-7 text-gray-700 sm:text-base">
        {text}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onAnswer("Да")}
          className={`rounded-2xl px-5 py-3 ${
            answer === "Да"
              ? "bg-black text-white"
              : "border border-gray-300 bg-white text-black"
          }`}
        >
          Да
        </button>

        <button
          type="button"
          onClick={() => onAnswer("Нет")}
          className={`rounded-2xl px-5 py-3 ${
            answer === "Нет"
              ? "bg-black text-white"
              : "border border-gray-300 bg-white text-black"
          }`}
        >
          Нет
        </button>
      </div>
    </div>
  );
}