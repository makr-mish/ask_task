"use client";

type TaskHeaderCardProps = {
  feedbackId: string | null;
  taskText: string;
  loading: boolean;
  platformSlug?: string;
  showDecisionButtons?: boolean;
  disableYesNo?: boolean;
  onYes: () => void;
  onNo: () => void;
  onReset: () => void;
};

function normalizeTaskLink(value: string): string | null {
  const raw = value.trim();

  if (!raw) return null;

  try {
    const directUrl = new URL(raw);
    if (directUrl.protocol === "http:" || directUrl.protocol === "https:") {
      return directUrl.toString();
    }
  } catch {
    // идём дальше
  }

  const withHttps = `https://${raw.replace(/^\/+/, "")}`;

  try {
    const parsed = new URL(withHttps);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname.includes(".") &&
      !hostname.includes(" ") &&
      !raw.includes(" ")
    ) {
      return parsed.toString();
    }
  } catch {
    // не ссылка
  }

  return null;
}

export default function TaskHeaderCard({
  feedbackId,
  taskText,
  loading,
  platformSlug,
  showDecisionButtons = true,
  disableYesNo = false,
  onYes,
  onNo,
  onReset,
}: TaskHeaderCardProps) {
  const cleanTaskText = taskText?.trim() || "";
  const normalizedLink = normalizeTaskLink(cleanTaskText);
  const isLink = !!normalizedLink;
  const taskTitle =
    platformSlug === "yandex"
      ? 'Ваше задание найти компанию в поисковике Яндекс. Введите запрос:'
      : platformSlug === "google-maps"
        ? 'Ваше задание найти компанию в поисковике Google. Введите запрос:'
        : 'Ваше задание перейти на карточку компании:';

  return (
    <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
      {feedbackId && (
        <p className="mb-4 text-sm font-medium text-gray-500 sm:text-base">
          ID отзыва: <span className="font-semibold text-black">{feedbackId}</span>
        </p>
      )}

      <h2 className="text-xl font-semibold leading-snug text-black sm:text-2xl">
        {taskTitle}
      </h2>

      <div className="mt-4 rounded-2xl bg-white p-4 sm:p-5">
        {isLink ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-gray-600 sm:text-base">
                Ссылка на компанию
              </p>

              <a
                href={normalizedLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-base font-medium text-blue-700 underline sm:text-lg"
              >
                {cleanTaskText}
              </a>
            </div>

            <a
              href={normalizedLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-2xl bg-black px-5 py-3 text-white"
            >
              Перейти
            </a>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onMouseDown={(e) => {
              if (e.detail > 1) e.preventDefault();
            }}
            onKeyDown={(e) => {
              const isCtrl = e.ctrlKey || e.metaKey;
              if (!isCtrl) return;

              const key = e.key.toLowerCase();
              if (key === "c" || key === "a" || key === "x") {
                e.preventDefault();
              }
            }}
            tabIndex={0}
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            <div className="mb-3 inline-flex rounded-xl bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Копирование запрещено
            </div>

            <p className="break-words text-base leading-7 text-gray-800 sm:text-lg">
              {cleanTaskText}
            </p>
          </div>
        )}
      </div>

<p className="mb-3 text-[18px] font-semibold text-black">
  Получилось найти компанию?
</p>

      {showDecisionButtons && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onYes}
            disabled={loading || disableYesNo}
            className="rounded-2xl bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Да
          </button>

          <button
            onClick={onNo}
            disabled={loading || disableYesNo}
            className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Нет
          </button>

          <button
            onClick={onReset}
            disabled={loading}
            className="rounded-2xl border border-red-300 bg-red-50 px-6 py-3 text-red-700 disabled:opacity-40"
          >
            Сбросить задание
          </button>
        </div>
      )}
    </div>
  );
}