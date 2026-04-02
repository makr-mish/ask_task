"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TaskHeaderCard from "@/app/src/components/tasks/TaskHeaderCard";
import ControlQuestionCard from "@/app/src/components/tasks/ControlQuestionCard";
import ExampleCard from "@/app/src/components/tasks/ExampleCard";
import InfoBlock from "@/app/src/components/tasks/InfoBlock";
import StatusCard from "@/app/src/components/tasks/StatusCard";
import LoadingStatusCard from "@/app/src/components/tasks/LoadingStatusCard";
import {
  getNextPlatformStep,
  getPlatformControlQuestionIds,
  getPlatformTimerSeconds,
  hasPlatformStep,
} from "@/app/src/config/taskStepConfig";
import {
  clientApiRequest,
  getControlQuestion,
  getFeedback,
  getReviewText,
  getTask,
  updateReviewStatus,
} from "@/lib/task-api";
import { getPlatformAdapter } from "@/lib/task-engine/platform-adapters";
import type {
  AppUser,
  EngineStepState,
  YesNoAnswer,
} from "@/lib/task-engine/types";
import type { PlatformConfig } from "@/lib/platforms";

type PreviewModalProps = {
  open: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
};

function PreviewModal({
  open,
  imageSrc,
  imageAlt,
  onClose,
}: PreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl rounded-3xl bg-white p-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm"
        >
          Закрыть
        </button>

        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-h-[80vh] w-full rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}

function resetEngineState(setters: {
  setStepState: (value: EngineStepState) => void;
  setFeedbackId: (value: string | null) => void;
  setFbId: (value: string | null) => void;
  setSiteId: (value: string | null) => void;
  setTaskText: (value: string) => void;
  setPhoneFileName: (value: string) => void;
  setPhoneReason: (value: string) => void;
  setSiteValue: (value: string) => void;
  setQuestionTexts: (value: Record<string, string>) => void;
  setQuestionAnswers: (value: Record<string, YesNoAnswer>) => void;
  setTimerSeconds: (value: number) => void;
  setReviewText: (value: string) => void;
  setSubmitResultId: (value: string | null) => void;
}) {
  setters.setStepState("form");
  setters.setFeedbackId(null);
  setters.setFbId(null);
  setters.setSiteId(null);
  setters.setTaskText("");
  setters.setPhoneFileName("");
  setters.setPhoneReason("");
  setters.setSiteValue("");
  setters.setQuestionTexts({});
  setters.setQuestionAnswers({});
  setters.setTimerSeconds(10);
  setters.setReviewText("");
  setters.setSubmitResultId(null);
}

export default function UniversalTaskEngine({
  platform,
}: {
  platform: PlatformConfig;
}) {
  const router = useRouter();
  const adapter = getPlatformAdapter(platform.slug);

  const platformKey = platform.slug;

  const [user, setUser] = useState<AppUser | null>(null);

  const [accountName, setAccountName] = useState("");
  const [gender, setGender] = useState("Любой");
  const [region, setRegion] = useState("");
  const [regionError, setRegionError] = useState("");
  const [regionHelpOpen, setRegionHelpOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [stepState, setStepState] = useState<EngineStepState>("form");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [timerSeconds, setTimerSeconds] = useState(
    getPlatformTimerSeconds(platformKey),
  );
  const [reviewText, setReviewText] = useState("");
  const [submitResultId, setSubmitResultId] = useState<string | null>(null);

  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [fbId, setFbId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [taskText, setTaskText] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [phoneFileName, setPhoneFileName] = useState("");
  const [phoneReason, setPhoneReason] = useState("");
  const [siteValue, setSiteValue] = useState("");

  const [phonePreviewOpen, setPhonePreviewOpen] = useState(false);
  const [sitePreviewOpen, setSitePreviewOpen] = useState(false);

  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionTexts, setQuestionTexts] = useState<Record<string, string>>({});
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, YesNoAnswer>
  >({});

  const previewImages = useMemo(
    () =>
      adapter?.getPreviewImages?.() ?? {
        phoneExampleImage: "",
        siteExampleImage: "",
        regionHelpImage: "",
      },
    [adapter],
  );

  useEffect(() => {
    const rawTgUser = localStorage.getItem("tg_user");
    const userId = localStorage.getItem("user_id");

    if (rawTgUser) {
      try {
        const parsed = JSON.parse(rawTgUser);
        setUser({
          USER_ID_TEXT: String(parsed.USER_ID_TEXT),
          first_name: parsed.first_name || "Telegram user",
          username: parsed.username || "",
        });
        return;
      } catch {
        localStorage.removeItem("tg_user");
      }
    }

    if (userId) {
      setUser({
        USER_ID_TEXT: String(userId),
        first_name: "Пользователь",
        username: "",
      });
      return;
    }

    window.location.href = "/login";
  }, []);

  const USER_ID_TEXT = user?.USER_ID_TEXT || "";
  const profileName = user?.first_name || "—";
  const telegramUsername = user?.username || "—";

  const controlQuestionIds = getPlatformControlQuestionIds(platformKey);
  const requiresRegion = platformKey === "yandex";
  const showsGender = platformKey === "yandex" || platformKey === "yandex-browser";

  const allQuestionsAnswered =
    controlQuestionIds.length === 0
      ? true
      : controlQuestionIds.every((id) => questionAnswers[id] !== null);

  const rewardText = adapter?.getRewardText?.(platform) ?? `${platform.price}₽`;

  const validateRegion = (value: string) => {
    const clean = value.replace(/[^\d]/g, "");
    setRegion(clean);

    if (!clean) {
      setRegionError("");
      return;
    }

    const num = Number(clean);
    if (num > 100) {
      setRegionError("Неверный код");
    } else {
      setRegionError("");
    }
  };

  const loadControlQuestions = async () => {
    if (!siteId) {
      alert("Не найден id площадки для контрольных вопросов");
      return;
    }

    try {
      setQuestionsLoading(true);

      const responses = await Promise.all(
        controlQuestionIds.map((questionId) =>
          getControlQuestion(platformKey, {
            userIdText: USER_ID_TEXT,
            fb_id: siteId,
            default_id: questionId,
          }),
        ),
      );

      const nextTexts: Record<string, string> = {};
      const nextAnswers: Record<string, YesNoAnswer> = {};

      controlQuestionIds.forEach((questionId, index) => {
        nextTexts[questionId] =
          responses[index]?.question || `Контрольный вопрос ${index + 1}`;
        nextAnswers[questionId] = null;
      });

      setQuestionTexts(nextTexts);
      setQuestionAnswers(nextAnswers);
      setStepState("controlQuestions");
    } catch (error) {
      console.error(error);
      alert("Ошибка при загрузке контрольных вопросов");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const goToNextStep = async (currentStep: string) => {
    const next = getNextPlatformStep(platformKey, currentStep as never);

    if (!next) return;

    if (next === "controlQuestions") {
      await loadControlQuestions();
      return;
    }

    if (next === "moderationTimer") {
      setStepState("moderationTimer");
      const startSeconds = getPlatformTimerSeconds(platformKey);
      setTimerSeconds(startSeconds);

      let seconds = startSeconds;

      const interval = setInterval(() => {
        seconds -= 1;
        setTimerSeconds(seconds);

        if (seconds <= 0) {
          clearInterval(interval);

          const afterTimer = getNextPlatformStep(platformKey, "moderationTimer");
          if (afterTimer) {
            setStepState(afterTimer as EngineStepState);
          }
        }
      }, 1000);

      return;
    }

    setStepState(next as EngineStepState);
  };

  const handleGetFeedbackId = async () => {
    if (!USER_ID_TEXT) {
      setModalMessage("Не найден ID пользователя");
      setIsModalOpen(true);
      return;
    }

    if (!accountName.trim()) {
      setModalMessage("Введите имя аккаунта");
      setIsModalOpen(true);
      return;
    }

    if (requiresRegion && !region.trim()) {
      setModalMessage("Введите номер региона");
      setIsModalOpen(true);
      return;
    }

    if (requiresRegion && Number(region) > 100) {
      setRegionError("Неверный код");
      return;
    }

    try {
      setLoading(true);
      setResetMessage("");

      const feedbackData = await getFeedback(platformKey, {
        userIdText: USER_ID_TEXT,
        gender,
        telegram_id: USER_ID_TEXT,
        telegram_username: telegramUsername === "—" ? "" : telegramUsername,
        account_name: accountName.trim(),
        amount: String(platform.price),
        region: requiresRegion ? region.trim() : "",
      });

     setFeedbackId(feedbackData.feedbackId);
setFbId(feedbackData.fbId);
setSiteId(feedbackData.siteId);
setStepState("loadingTask");

await new Promise((resolve) => setTimeout(resolve, 2000));

if (platformKey === "yandex-browser") {
  const browserTaskText =
    String(
      feedbackData?.raw?.raw?.link_post ??
        feedbackData?.raw?.data?.link_post ??
        feedbackData?.raw?.link_post ??
        "Откройте карточку организации в Яндекс Браузере и выполните задание.",
    ).trim();

  setTaskText(browserTaskText);
  setStepState("taskReady");
  return;
}

const taskData = await getTask(platformKey, {
  userIdText: USER_ID_TEXT,
  fb_id: feedbackData.fbId,
});

if (!taskData?.taskText || !taskData.taskText.trim()) {
  throw new Error("Не удалось получить задание");
}

setTaskText(taskData.taskText);
setStepState("taskReady");
} catch (error) {
  console.error(error);

  const message =
    error instanceof Error
      ? error.message
      : "Ошибка при получении задания";

  setModalMessage(message);
  setIsModalOpen(true);
  setStepState("form");
} finally {
      setLoading(false);
    }
  };

  const handleResetTask = async (options?: { stayHere?: boolean }) => {
    if (!fbId) {
      alert("Не найден fb_id для сброса");
      return;
    }

    if (!platform.api?.resetTask) {
      alert("Для этой платформы не настроен сброс задания");
      return;
    }

    try {
      setLoading(true);

      const data: any = await clientApiRequest(platform.api.resetTask, {
        body: {
          userIdText: USER_ID_TEXT,
          fb_id: fbId,
        },
      });

      const result = data?.result || data?.data?.result || fbId;

      setResetMessage(
        `Задание ID ${result} сброшено, вы можете взять новое задание`,
      );

      setTimeout(() => {
        setResetMessage("");
      }, 10000);

      if (options?.stayHere) {
        resetEngineState({
          setStepState,
          setFeedbackId,
          setFbId,
          setSiteId,
          setTaskText,
          setPhoneFileName,
          setPhoneReason,
          setSiteValue,
          setQuestionTexts,
          setQuestionAnswers,
          setTimerSeconds,
          setReviewText,
          setSubmitResultId,
        });
        return;
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Ошибка при сбросе задания");
    } finally {
      setLoading(false);
    }
  };

  const handleStartFlow = () => {
    setPhoneFileName("");
    setPhoneReason("");
    setSiteValue("");
    setQuestionTexts({});
    setQuestionAnswers({});
    setTimerSeconds(getPlatformTimerSeconds(platformKey));
    setReviewText("");
    setSubmitResultId(null);

    const firstStep =
      hasPlatformStep(platformKey, "phoneCheck")
        ? "phoneCheck"
        : hasPlatformStep(platformKey, "siteCheck")
          ? "siteCheck"
          : hasPlatformStep(platformKey, "controlQuestions")
            ? "controlQuestions"
            : hasPlatformStep(platformKey, "moderationTimer")
              ? "moderationTimer"
              : hasPlatformStep(platformKey, "reviewReady")
                ? "reviewReady"
                : null;

    if (!firstStep) {
      setStepState("taskReady");
      return;
    }

    if (firstStep === "controlQuestions") {
      void loadControlQuestions();
      return;
    }

    if (firstStep === "moderationTimer") {
      void goToNextStep("controlQuestions");
      return;
    }

    setStepState(firstStep);
  };

  const handlePhoneSubmit = async () => {
    const hasFile = !!phoneFileName;
    const hasReason = !!phoneReason.trim();

    if (!hasFile && !hasReason) {
      alert("Прикрепите скриншот звонка или укажите причину");
      return;
    }

    setStepState("phoneChecking");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await goToNextStep("phoneCheck");
  };

  const handleSiteSubmit = async () => {
    if (!siteValue.trim()) {
      alert("Введите адрес сайта или укажите причину");
      return;
    }

    setStepState("siteChecking");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await goToNextStep("siteCheck");
  };

  const handleControlQuestionsNext = async () => {
    if (!allQuestionsAnswered) return;
    await goToNextStep("controlQuestions");
  };

  const handleGetReviewText = async () => {
    if (!siteId) {
      setModalMessage("Не найден id площадки для получения текста отзыва");
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      const data = await getReviewText(platformKey, {
        userIdText: USER_ID_TEXT,
        id_yandex_site: siteId,
      });

      setReviewText(data.text);
      setStepState("reviewText");
    } catch (error) {
      console.error(error);
      setModalMessage("Ошибка при получении текста отзыва");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = async () => {
    if (!siteId) {
      setModalMessage("Не найден id площадки для отправки на модерацию");
      setIsModalOpen(true);
      return;
    }

    try {
      setStepState("reviewSubmitting");
      setLoading(true);

      const data = await updateReviewStatus(platformKey, {
        userIdText: USER_ID_TEXT,
        fb_id: siteId,
        fb_status:
          adapter?.getReviewStatusLabel?.() ?? "На проверке модератора",
      });

      setSubmitResultId(String(data.resultId));
      setStepState("reviewSubmitted");
    } catch (error) {
      console.error(error);
      setModalMessage("Ошибка при отправке на модерацию");
      setIsModalOpen(true);
      setStepState("reviewText");
    } finally {
      setLoading(false);
    }
  };

  const showTaskHeader =
    stepState === "taskReady" ||
    stepState === "phoneCheck" ||
    stepState === "phoneChecking" ||
    stepState === "siteCheck" ||
    stepState === "siteChecking" ||
    stepState === "controlQuestions" ||
    stepState === "moderationTimer" ||
    stepState === "reviewReady" ||
    stepState === "reviewText" ||
    stepState === "reviewSubmitting" ||
    stepState === "reviewSubmitted";

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">Загрузка...</div>
      </div>
    );
  }

  if (!adapter) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-black">{platform.label}</h1>
          <p className="mt-3 text-gray-600">
            Для этой платформы пока не подключён адаптер.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-2xl border border-gray-300 bg-white px-5 py-3"
          >
            Назад в главное меню
          </button>
        </div>
      </div>
    );
  }

  const question1Id = controlQuestionIds[0];
  const question2Id = controlQuestionIds[1];
  const question3Id = controlQuestionIds[2];

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black sm:text-5xl">
              {platform.label}
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:mt-3 sm:text-lg">
              Заполните данные аккаунта, чтобы получить задание.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg"
          >
            Назад
          </button>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-8">
          <div className="mb-6 rounded-3xl bg-[#f7f8fb] p-4 sm:p-6">
            <div className="space-y-3 text-base text-gray-700 sm:space-y-4 sm:text-[18px]">
              <p>
                <span className="font-semibold text-gray-900">Ваш профиль:</span>{" "}
                {profileName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  ID пользователя:
                </span>{" "}
                {USER_ID_TEXT}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Username:</span>{" "}
                {telegramUsername}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Вознаграждение за задание:
                </span>{" "}
                {rewardText}
              </p>
            </div>
          </div>

          {resetMessage && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
              {resetMessage}
            </div>
          )}

          {platformKey === "flamp" && (
            <div className="mb-6 rounded-[28px] bg-[#f5f7fb] p-5 sm:p-6">
              <h3 className="text-[22px] font-semibold text-black">
                Дополнительная информация
              </h3>

              <p className="mt-3 text-[16px] leading-7 text-[#4b5563]">
                Для начала работы авторизуйтесь через ваш профиль Вконтакте на сайте flamp.ru
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb]">
                <img
                  src="https://i.postimg.cc/MZ5h6Wqs/64168009ac8bd7cef6e4240929c38950-full.png"
                  alt="Инструкция Flamp"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {platformKey === "vk" && (
            <div className="mb-6 rounded-[28px] bg-[#f5f7fb] p-5 sm:p-6">
              <h3 className="text-[22px] font-semibold text-black">
                Дополнительная информация
              </h3>

              <p className="mt-3 text-[16px] leading-7 text-[#4b5563]">
                Чтобы отзыв прошел с большей вероятностью, обязательно подпишитесь на группу компании и напишите приветственные сообщения перед отправкой отзыва
              </p>

              <div className="mt-4 flex justify-center">
                <img
                  src="https://i.postimg.cc/GhykRn8b/Screenshot-42.jpg"
                  alt="Инструкция VK"
                  className="w-full max-w-[500px] rounded-2xl border border-[#e5e7eb]"
                />
              </div>
            </div>
          )}

          {platformKey === "twogis" && (
            <div className="mb-6 rounded-[28px] bg-[#f5f7fb] p-5 sm:p-6">
              <h3 className="text-[22px] font-semibold text-black">
                Дополнительная информация
              </h3>

              <p className="mt-3 text-[16px] leading-7 text-[#4b5563]">
                Чтобы выполнить это задание, вам необходимо закрыть ваш профиль на 2ГИС.
                <br />
                <br />
                Как это сделать? Перейдите по ссылке{" "}
                <a
                  href="https://2gis.ru/n_novgorod/favorites/preferences"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  https://2gis.ru/n_novgorod/favorites/preferences
                </a>
                <br />
                и отметьте галочку "Закрытый профиль".
              </p>

              <div className="mt-4 flex justify-center">
                <img
                  src="https://i.postimg.cc/dtsLHMRh/79baa17a1dbd63538168ded403fd215f-full.png"
                  alt="Инструкция 2ГИС"
                  className="w-full max-w-[500px] rounded-2xl border border-[#e5e7eb]"
                />
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl border p-4 transition sm:p-6 ${
              stepState !== "form" ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="mb-2 block text-base text-gray-600 sm:text-lg">
                  Имя аккаунта
                </label>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Введите имя аккаунта"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-lg outline-none sm:px-5 sm:py-4 sm:text-xl"
                />
              </div>

              {showsGender && (
                <div>
                  <label className="mb-2 block text-base text-gray-600 sm:text-lg">
                    Пол аккаунта
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-lg outline-none sm:px-5 sm:py-4 sm:text-xl"
                  >
                    <option>Любой</option>
                    <option>Мужской</option>
                    <option>Женский</option>
                  </select>
                </div>
              )}

              {requiresRegion && (
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <label className="block text-base text-gray-600 sm:text-lg">
                      Номер региона
                    </label>

                    {!!previewImages.regionHelpImage && (
                      <button
                        type="button"
                        onClick={() => setRegionHelpOpen(true)}
                        className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
                      >
                        Какой у меня регион?
                      </button>
                    )}
                  </div>

                  <input
                    value={region}
                    onChange={(e) => validateRegion(e.target.value)}
                    placeholder="Введите номер региона"
                    className={`w-full rounded-2xl border px-4 py-3 text-lg outline-none sm:px-5 sm:py-4 sm:text-xl ${
                      regionError ? "border-red-400" : "border-gray-300"
                    }`}
                  />

                  {regionError && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {regionError}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleGetFeedbackId}
                disabled={loading || stepState !== "form" || (requiresRegion && !!regionError)}
                className="w-full rounded-2xl bg-black px-6 py-4 text-lg text-white disabled:opacity-70 sm:text-xl"
              >
                {loading && stepState === "form"
                  ? "Получаем задание..."
                  : "Получить задание"}
              </button>
            </div>
          </div>

          {stepState === "loadingTask" && (
            <LoadingStatusCard
              text="Начинаю подбор задания, обычно этот процесс занимает не более 30 секунд.."
              subtext="Подбираем задание..."
            />
          )}

          {showTaskHeader && (
            <TaskHeaderCard
              feedbackId={feedbackId}
              taskText={taskText}
              loading={loading}
              showDecisionButtons
              disableYesNo={stepState !== "taskReady"}
              onYes={handleStartFlow}
              onNo={() => handleResetTask({ stayHere: true })}
              onReset={() => handleResetTask({ stayHere: true })}
            />
          )}

          {hasPlatformStep(platformKey, "phoneCheck") &&
            stepState === "phoneCheck" &&
            !!previewImages.phoneExampleImage && (
              <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
                <ExampleCard
                  title="Проверка номера телефона"
                  imageSrc={previewImages.phoneExampleImage}
                  imageAlt="Пример скриншота звонка"
                  caption="Пример скриншота звонка"
                  onOpenPreview={() => setPhonePreviewOpen(true)}
                />

                <InfoBlock
                  heading="Что нужно сделать"
                  intro={
                    <>
                      <p>
                        <span className="font-semibold">
                          Теперь вам необходимо осуществить звонок
                        </span>{" "}
                        в указанную организацию.
                      </p>
                      <p className="mt-3">
                        Совершение соединения является{" "}
                        <span className="font-semibold">
                          приоритетной задачей для прохождения отзыва
                        </span>
                        , при этом содержание разговора значения не имеет.
                        Достаточно просто дозвониться до абонента.
                      </p>
                    </>
                  }
                  actionTitle1="Что отправить"
                  actionText1="Пришлите скриншот звонка"
                  actionTitle2="Важно"
                  actionText2="Звонок должен быть минимум 5 секунд"
                />

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white p-4 sm:p-5">
                    <label className="mb-3 block text-base font-medium text-gray-800 sm:text-lg">
                      Прикрепите скриншот звонка
                    </label>

                    <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-black bg-black px-5 py-3 text-white hover:opacity-90">
                      <span className="text-sm font-medium sm:text-base">
                        Выбрать файл
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setPhoneFileName(file ? file.name : "");
                        }}
                      />
                    </label>

                    <p className="mt-3 text-sm text-gray-500">
                      {phoneFileName
                        ? `Выбран файл: ${phoneFileName}`
                        : "Файл пока не выбран"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 sm:p-5">
                    <label className="mb-3 block text-base font-medium text-gray-800 sm:text-lg">
                      Если вы не можете это сделать — напишите причину в форму ниже
                    </label>
                    <textarea
                      value={phoneReason}
                      onChange={(e) => setPhoneReason(e.target.value)}
                      placeholder="Напишите причину"
                      rows={4}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none sm:px-5 sm:py-4 sm:text-lg"
                    />
                  </div>

                  <button
                    onClick={handlePhoneSubmit}
                    className="rounded-2xl bg-black px-6 py-3 text-base text-white sm:py-4 sm:text-xl"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            )}

          {stepState === "phoneChecking" && (
            <LoadingStatusCard text="" subtext="Проверяю ответ" />
          )}

          {hasPlatformStep(platformKey, "siteCheck") &&
            stepState === "siteCheck" &&
            !!previewImages.siteExampleImage && (
              <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
                <ExampleCard
                  title="Проверка сайта компании"
                  imageSrc={previewImages.siteExampleImage}
                  imageAlt="Где найти ссылку на сайт?"
                  caption="Где найти ссылку на сайт?"
                  onOpenPreview={() => setSitePreviewOpen(true)}
                />

                <InfoBlock
                  heading="Что нужно сделать"
                  intro={
                    <p>
                      Вам нужно{" "}
                      <span className="font-semibold">
                        найти сайт компании и перейти на него
                      </span>
                      .
                    </p>
                  }
                  actionTitle1="Что отправить"
                  actionText1="Скопируйте в вашем мобильном браузере ссылку на этот сайт и пришлите в бота"
                  actionTitle2="Если не получается"
                  actionText2="Укажите причину, почему вы не можете это сделать"
                />

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white p-4 sm:p-5">
                    <label className="mb-3 block text-base font-medium text-gray-800 sm:text-lg">
                      Введите адрес сайта или напишите причину, почему не можете это сделать
                    </label>
                    <textarea
                      value={siteValue}
                      onChange={(e) => setSiteValue(e.target.value)}
                      placeholder="Введите адрес сайта или напишите причину, почему не можете это сделать"
                      rows={4}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none sm:px-5 sm:py-4 sm:text-lg"
                    />
                  </div>

                  <button
                    onClick={handleSiteSubmit}
                    className="rounded-2xl bg-black px-6 py-3 text-base text-white sm:py-4 sm:text-xl"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            )}

          {stepState === "siteChecking" && (
            <LoadingStatusCard text="" subtext="Проверяю ответ" />
          )}

          {hasPlatformStep(platformKey, "controlQuestions") &&
            stepState === "controlQuestions" && (
              <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-black sm:text-2xl">
                    Контрольные вопросы
                  </h2>

                  {questionsLoading && (
                    <span className="text-sm text-gray-500">Загружаем...</span>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  {question1Id && (
                    <ControlQuestionCard
                      number={1}
                      text={questionTexts[question1Id] || "Загрузка вопроса..."}
                      answer={questionAnswers[question1Id] ?? null}
                      onAnswer={(value) =>
                        setQuestionAnswers((prev) => ({
                          ...prev,
                          [question1Id]: value,
                        }))
                      }
                    />
                  )}

                  {question2Id && (
                    <ControlQuestionCard
                      number={2}
                      text={questionTexts[question2Id] || "Загрузка вопроса..."}
                      answer={questionAnswers[question2Id] ?? null}
                      onAnswer={(value) =>
                        setQuestionAnswers((prev) => ({
                          ...prev,
                          [question2Id]: value,
                        }))
                      }
                    />
                  )}

                  {question3Id && (
                    <ControlQuestionCard
                      number={3}
title={
  platformKey === "yandex-uslugi"
    ? "Есть ли данный отзыв в карточке исполнителя"
    : "Есть ли данный отзыв в карточке компании"
}
                      text={questionTexts[question3Id] || "Загрузка вопроса..."}
                      answer={questionAnswers[question3Id] ?? null}
                      onAnswer={(value) =>
                        setQuestionAnswers((prev) => ({
                          ...prev,
                          [question3Id]: value,
                        }))
                      }
                    />
                  )}
                </div>

                <button
                  onClick={handleControlQuestionsNext}
                  disabled={!allQuestionsAnswered}
                  className="mt-6 rounded-2xl bg-black px-6 py-3 text-base text-white disabled:cursor-not-allowed disabled:opacity-40 sm:py-4 sm:text-xl"
                >
                  Далее
                </button>
              </div>
            )}

          {hasPlatformStep(platformKey, "moderationTimer") &&
            stepState === "moderationTimer" && (
              <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-black sm:text-2xl">
                  Ожидание проверки
                </h2>

                <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-5">
                  <div className="flex h-16 w-[72px] items-center justify-center rounded-full bg-black text-2xl font-bold tabular-nums text-white">
                    {String(timerSeconds).padStart(2, "0")}
                  </div>

                  <div>
                    <p className="text-base font-medium text-black sm:text-lg">
                      Ожидаем подтверждение от системы
                    </p>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">
                      После окончания таймера вы получите текст отзыва для публикации. Не закрывайте страницу.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {hasPlatformStep(platformKey, "reviewReady") &&
            stepState === "reviewReady" && (
              <StatusCard
                title="Вы можете публиковать отзыв!"
                text="Нажмите кнопку ниже, чтобы получить текст отзыва для публикации."
              >
                <button
                  onClick={handleGetReviewText}
                  disabled={loading}
                  className="mt-5 rounded-2xl bg-black px-6 py-3 text-base text-white sm:py-4 sm:text-xl"
                >
                  {loading ? "Получаем..." : "Получить текст отзыва"}
                </button>
              </StatusCard>
            )}

          {hasPlatformStep(platformKey, "reviewText") &&
            stepState === "reviewText" && (
              <StatusCard title="Текст отзыва">
                <div
                  className="relative mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
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

                  <p className="whitespace-pre-line break-words text-sm leading-7 text-gray-700 sm:text-base">
                    {reviewText}
                  </p>

                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-transparent backdrop-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.03)_100%)]" />
                </div>

                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-900 sm:text-base">
                  Данный текст отзыва не копируется, перепишите самостоятельно. После отправки отзыва обязательно нажмите кнопку "Отзыв отправлен".
                </div>

                <button
                  onClick={handleReviewSubmitted}
                  disabled={loading}
                  className="mt-6 rounded-2xl bg-black px-6 py-3 text-base text-white sm:py-4 sm:text-xl"
                >
                  Отзыв отправлен
                </button>
              </StatusCard>
            )}

          {stepState === "reviewSubmitting" && (
            <LoadingStatusCard
              text="Отправляем статус отзыва на модерацию..."
              subtext="Пожалуйста, подождите"
            />
          )}

          {hasPlatformStep(platformKey, "reviewSubmitted") &&
            stepState === "reviewSubmitted" && (
              <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
                <div className="rounded-2xl bg-white p-4 sm:p-5">
                  <h2 className="text-xl font-semibold text-black sm:text-2xl">
                    ✅ Ваш отзыв отправлен на модерацию
                  </h2>

                  <div className="mt-4 text-sm leading-7 text-gray-700 sm:text-base">
                    <p>
                      Отзыв ID <span className="font-semibold">"{submitResultId}"</span>{" "}
                      отправлен на модерацию.
                    </p>

                    <p className="mt-3">
                      Ожидайте поступление на текущий баланс в течении 5-6 дней.
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-7 text-red-800 sm:text-base">
                    <p className="font-semibold">Запрещается:</p>

                    <p className="mt-3">⛔ Изменять текст отзыва</p>
                    <p>⛔ Удалять отзыв после публикации</p>
                    <p>⛔ Менять имя аккаунта после публикации отзыва</p>
                    <p>⛔ Публиковать отзывы чаще, чем 1 отзыв в 5 дней</p>

                    <p className="mt-4 font-semibold">
                      В противном случае вы получаете вечный бан.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-6 rounded-2xl bg-black px-6 py-3 text-base text-white sm:py-4 sm:text-xl"
                  >
                    Назад в главное меню
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      <PreviewModal
        open={regionHelpOpen}
        imageSrc={previewImages.regionHelpImage || ""}
        imageAlt="Как узнать регион"
        onClose={() => setRegionHelpOpen(false)}
      />

      <PreviewModal
        open={phonePreviewOpen}
        imageSrc={previewImages.phoneExampleImage || ""}
        imageAlt="Пример звонка"
        onClose={() => setPhonePreviewOpen(false)}
      />

      <PreviewModal
        open={sitePreviewOpen}
        imageSrc={previewImages.siteExampleImage || ""}
        imageAlt="Пример сайта"
        onClose={() => setSitePreviewOpen(false)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-black">Сообщение</h3>
            <p className="mt-3 text-gray-700">{modalMessage}</p>

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full rounded-2xl bg-black px-5 py-3 text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}