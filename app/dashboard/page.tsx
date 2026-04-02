"use client";

import { PLATFORMS } from "@/lib/platforms";
import Link from "next/link";
import { MouseEvent, useEffect, useState } from "react";

type TgUser = {
  USER_ID_TEXT: string;
  first_name: string;
  username?: string;
};

type AppUser = {
  USER_ID_TEXT: string;
  first_name: string;
  username?: string;
};

type BalanceResponse = {
  balancePending?: number | string;
  balance?: number | string;
  balanceWithdraw?: number | string;
};

type RippleState = {
  x: number;
  y: number;
  key: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<AppUser | null>(null);

  const visiblePlatforms = PLATFORMS.filter((p) => p.key !== "BANKS_RU");

  const [freeCounts, setFreeCounts] = useState<Record<string, string>>({});
  const [loadingFree, setLoadingFree] = useState(false);
  const [freeLoaded, setFreeLoaded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);

  const [balanceData, setBalanceData] = useState<{
    pending: number;
    current: number;
    withdraw: number;
  } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceInfoOpen, setBalanceInfoOpen] = useState(false);

  const [reviewId, setReviewId] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState<{
    fb_status: string;
    status_date: string;
  } | null>(null);

  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const [reviewsRipple, setReviewsRipple] = useState<RippleState | null>(null);
  const [activitiesRipple, setActivitiesRipple] = useState<RippleState | null>(
    null,
  );

  const getTaskCardStyle = (value: string | number | undefined) => {
    const num = Number(value ?? 0);
    const safeNum = Number.isFinite(num) ? Math.max(0, num) : 0;
    const progress = Math.min(safeNum / 30, 1);
    const progressPercent = Math.round(progress * 100);

    if (safeNum <= 0) {
      return {
        background:
          "linear-gradient(90deg, rgba(241,245,249,0.96) 0%, rgba(226,232,240,0.96) 100%)",
        borderColor: "rgba(203,213,225,0.95)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      };
    }

    const fillStrong = 0.1 + progress * 0.22;
    const fillSoft = 0.06 + progress * 0.14;
    const borderAlpha = 0.18 + progress * 0.22;
    const glowAlpha = 0.04 + progress * 0.1;

    return {
      background: `linear-gradient(
        90deg,
        rgba(187,247,208,${fillStrong}) 0%,
        rgba(220,252,231,${fillSoft}) ${progressPercent}%,
        rgba(255,255,255,0.97) ${progressPercent}%,
        rgba(248,250,252,0.98) 100%
      )`,
      borderColor: `rgba(34,197,94,${borderAlpha})`,
      boxShadow: `0 10px 24px rgba(15,23,42,0.05), inset 0 0 0 1px rgba(255,255,255,0.35), 0 0 0 1px rgba(34,197,94,${glowAlpha})`,
    };
  };

  const loadFreeCounts = async () => {
    if (!user) return;

    setLoadingFree(true);

    const results: Record<string, string> = {};

    await Promise.all(
      visiblePlatforms.map(async (platform) => {
        try {
          const url = `/api/free/${platform.path}?userId=${user.USER_ID_TEXT}`;
          const res = await fetch(url);
          const json = await res.json();

          if (!res.ok) {
            console.error(`Ошибка ${platform.key}:`, json);
            results[platform.key] = "Ошибка";
            return;
          }

          const data = json.data;

          if (data?.result !== undefined) {
            results[platform.key] = String(data.result);
          } else if (typeof data === "number" || typeof data === "string") {
            results[platform.key] = String(data);
          } else {
            results[platform.key] = "0";
          }
        } catch (error) {
          console.error(`Ошибка загрузки ${platform.key}:`, error);
          results[platform.key] = "Ошибка";
        }
      }),
    );

    setFreeCounts(results);
    setFreeLoaded(true);
    setLoadingFree(false);
  };

  const createRipple = (
    event: MouseEvent<HTMLDivElement>,
    setter: (value: RippleState | null) => void,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const key = Date.now();

    setter({ x, y, key });

    window.setTimeout(() => {
      setter(null);
    }, 550);
  };

  const handleReviewsCardClick = (event: MouseEvent<HTMLDivElement>) => {
    createRipple(event, setReviewsRipple);

    const next = !reviewsExpanded;
    setReviewsExpanded(next);

    if (next && !freeLoaded) {
      void loadFreeCounts();
    }
  };

  const handleActivitiesCardClick = (event: MouseEvent<HTMLDivElement>) => {
    createRipple(event, setActivitiesRipple);
    setActivitiesExpanded((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("tg_user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const rawTgUser = localStorage.getItem("tg_user");
    const userId = localStorage.getItem("user_id");

    if (rawTgUser) {
      try {
        const parsed: TgUser = JSON.parse(rawTgUser);

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

  useEffect(() => {
    if (!user) return;

    const loadBalance = async () => {
      setBalanceLoading(true);

      try {
        const url = `/api/balance?userId=${user.USER_ID_TEXT}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok) {
          console.error("Ошибка загрузки баланса:", json);
          setBalanceData({
            pending: 0,
            current: 0,
            withdraw: 0,
          });
          return;
        }

        const data: BalanceResponse = json.data ?? {};

        setBalanceData({
          pending: Number(data.balancePending ?? 0),
          current: Number(data.balance ?? 0),
          withdraw: Number(data.balanceWithdraw ?? 0),
        });
      } catch (error) {
        console.error("Ошибка загрузки баланса:", error);
        setBalanceData({
          pending: 0,
          current: 0,
          withdraw: 0,
        });
      } finally {
        setBalanceLoading(false);
      }
    };

    void loadBalance();
  }, [user]);

  const handleCheckStatus = async () => {
    if (!user) return;

    if (!reviewId.trim()) {
      alert("Введите ID отзыва");
      return;
    }

    setStatusLoading(true);

    try {
      const url = `/api/feedback-status?userId=${user.USER_ID_TEXT}&fbId=${reviewId.trim()}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        console.error("Ошибка проверки статуса:", json);
        alert("Не удалось получить статус отзыва");
        return;
      }

      const data = json.data;

      let fbStatus = "Нет данных";
      let statusDate = "Нет данных";

      if (data && typeof data === "object") {
        if ("fb_status" in data && data.fb_status) {
          fbStatus = String(data.fb_status);
        }

        if ("status_date" in data && data.status_date) {
          statusDate = String(data.status_date);
        }

        if ("error" in data && data.error) {
          const errorText = String(data.error).trim();

          if (errorText === "Этот отзыв не ваш") {
            fbStatus = `Что-то пошло не так 😥

1. Убедитесь, что проверяете с аккаунта, которому бот выдавал задание.

2. Убедитесь, что вы полностью завершили задание`;
          } else {
            fbStatus = errorText;
          }
        }
      } else if (typeof data === "string") {
        const text = data.trim();

        if (text === "Не опубликован") {
          fbStatus = `Ваш отзыв не опубликован (отклонен)

Почему отзыв не опубликован?

Ваш отзыв не прошел систему модерации на платформе. Это бывает из-за того, что аккаунт неактивный или фиктивный.

Внимание! Он вам может отображаться, но если вы зайдете с другого браузера в эту же компанию (или в режиме инкогнито), то отзыва не увидите. Можете самостоятельно удалить такой отзыв, оплаты за него не будет.`;
        } else {
          fbStatus = text;
        }
      }

      if (fbStatus === "Нет данных") {
        if (typeof data === "string") {
          fbStatus = data;
        } else if (data) {
          fbStatus = JSON.stringify(data, null, 2);
        }
      }

      setStatusData({
        fb_status: fbStatus,
        status_date: statusDate,
      });

      setStatusModalOpen(true);
    } catch (error) {
      console.error("Ошибка проверки статуса:", error);
      alert("Ошибка проверки статуса");
    } finally {
      setStatusLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          Загрузка...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <div className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <h1 className="text-[32px] font-bold leading-[0.95] tracking-tight text-slate-900 sm:text-4xl">
                Личный кабинет
              </h1>

              <button
                onClick={handleLogout}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-5 text-[15px] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:h-12 sm:w-auto sm:px-6"
              >
                Выйти
              </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner sm:h-28 sm:w-28 sm:rounded-[28px]">
                <img
                  src="/avatar-placeholder.png"
                  alt="Аватар профиля"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2 text-[15px] text-slate-700 sm:space-y-4 sm:text-lg">
                <p>
                  <b className="text-slate-900">Ваш профиль:</b> {user.first_name}
                </p>
                <p>
                  <b className="text-slate-900">ID пользователя:</b> {user.USER_ID_TEXT}
                </p>
                <p>
                  <b className="text-slate-900">Username:</b> {user.username || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:rounded-[30px] sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <h2 className="text-[30px] font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">
              Доступные задания
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div
              onClick={handleReviewsCardClick}
              className="relative cursor-pointer overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:rounded-[26px] sm:p-5"
            >
              {reviewsRipple && (
                <span
                  key={reviewsRipple.key}
                  className="pointer-events-none absolute animate-ping rounded-full bg-slate-300/30"
                  style={{
                    left: reviewsRipple.x - 140,
                    top: reviewsRipple.y - 140,
                    width: 280,
                    height: 280,
                    animationDuration: "550ms",
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="max-w-[180px] text-[24px] font-bold leading-7 text-slate-900 sm:max-w-none sm:text-2xl">
                    Написание отзывов
                  </h3>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = !reviewsExpanded;
                      setReviewsExpanded(next);
                      if (next && !freeLoaded) {
                        void loadFreeCounts();
                      }
                    }}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-slate-50 sm:h-11 sm:px-5 sm:text-sm"
                  >
                    {reviewsExpanded ? "Свернуть" : "Открыть"}
                  </button>
                </div>

                {reviewsExpanded ? (
                  <>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <span className="text-sm text-slate-500">
                        {freeLoaded
                          ? "Данные обновлены"
                          : "Нажмите «Обновить» для загрузки данных"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void loadFreeCounts();
                        }}
                        className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:h-9 sm:w-auto"
                      >
                        Обновить
                      </button>
                    </div>

                    {loadingFree ? (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                        <span>Загрузка заданий...</span>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                        {visiblePlatforms.map((platform) => {
                          const freeValue = freeCounts[platform.key] ?? "0";
                          const cardStyle = getTaskCardStyle(freeValue);

                          const freeNum = Number(freeValue ?? 0);
                          const isZeroFree = Number.isFinite(freeNum)
                            ? freeNum <= 0
                            : false;
                          const isAvitoDisabled = platform.label === "Авито";
                          const isDreamJobDisabled =
                            platform.label === "Dream Job";
                          const isDisabledCard =
                            isAvitoDisabled || isDreamJobDisabled || isZeroFree;

                          return (
                            <div
                              key={platform.key}
                              style={cardStyle}
                              className={`rounded-[22px] border p-4 transition duration-300 sm:rounded-[24px] sm:p-5 ${
                                isDisabledCard
                                  ? "cursor-not-allowed opacity-70 grayscale-[0.2]"
                                  : "hover:-translate-y-[4px] hover:scale-[1.01] hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="text-[20px] font-bold text-slate-900 sm:text-[22px]">
                                  {platform.label}
                                </div>

                                <div className="inline-flex w-fit min-w-[70px] items-center justify-center rounded-2xl border border-white/50 bg-gradient-to-br from-white/40 to-white/10 px-4 py-2 text-[15px] font-semibold tracking-tight text-slate-900 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.15)] sm:text-base">
                                  Оплата {platform.price} руб
                                </div>
                              </div>

                              <div className="mb-4 text-[16px] text-slate-700 sm:mb-5 sm:text-[17px]">
                                Свободных отзывов: {freeCounts[platform.key] ?? "—"}
                              </div>

                              {isAvitoDisabled ? (
                                <button
                                  disabled
                                  className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200 px-5 text-[15px] font-medium text-slate-500 sm:w-auto sm:text-base"
                                >
                                  Временно недоступно
                                </button>
                              ) : isDreamJobDisabled ? (
                                <button
                                  disabled
                                  className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200 px-5 text-[15px] font-medium text-slate-500 sm:w-auto sm:text-base"
                                >
                                  Временно недоступно
                                </button>
                              ) : isZeroFree ? (
                                <button
                                  disabled
                                  className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200 px-5 text-[15px] font-medium text-slate-500 sm:w-auto sm:text-base"
                                >
                                  Нет свободных заданий
                                </button>
                              ) : platform.taskHref ? (
                                <Link
                                  href={platform.taskHref}
                                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-5 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 hover:shadow-[0_0_20px_rgba(15,23,42,0.25)] active:scale-[0.98] sm:w-auto sm:text-base"
                                >
                                  Взять задание
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200 px-5 text-[15px] font-medium text-slate-500 sm:w-auto sm:text-base"
                                >
                                  Скоро
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[15px] leading-6 text-slate-500">
                    Нажмите на блок, чтобы увидеть задания по отзывам
                  </p>
                )}
              </div>
            </div>

            <div
              onClick={handleActivitiesCardClick}
         className="relative cursor-pointer overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/70 p-4 shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:rounded-[26px] sm:p-5"     
            >
              {activitiesRipple && (
                <span
                  key={activitiesRipple.key}
                  className="pointer-events-none absolute animate-ping rounded-full bg-slate-300/30"
                  style={{
                    left: activitiesRipple.x - 140,
                    top: activitiesRipple.y - 140,
                    width: 280,
                    height: 280,
                    animationDuration: "550ms",
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="max-w-[180px] text-[24px] font-bold leading-7 text-slate-900 sm:max-w-none sm:text-2xl">
                    Выполнение активностей
                  </h3>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivitiesExpanded((prev) => !prev);
                    }}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-slate-50 sm:h-11 sm:px-5 sm:text-sm"
                  >
                    {activitiesExpanded ? "Свернуть" : "Открыть"}
                  </button>
                </div>

                {activitiesExpanded ? (
                  <div className="text-sm leading-6 text-slate-500">
                    Раздел активностей скоро появится. Здесь покажем быстрые задания и бонусы.
                  </div>
                ) : (
                  <p className="text-[15px] leading-6 text-slate-500">
                    Нажмите на блок, чтобы увидеть раздел активностей
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-2 xl:gap-6">
          <section className="rounded-[26px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:rounded-[28px] sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
              <h2 className="text-[30px] font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">
                Баланс
              </h2>

              <button
                onClick={() => setBalanceInfoOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-slate-50 sm:h-11 sm:px-5 sm:text-base"
              >
                Подробнее
              </button>
            </div>

            <div className="mb-4 rounded-[22px] border border-slate-200/70 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-inner sm:mb-5 sm:rounded-[24px] sm:p-5">
              <div className="mb-2 text-sm text-slate-500">
                Ваш потенциальный доход сегодня
              </div>
              <div className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                +{balanceData?.pending ?? 0} рублей
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 shadow-inner sm:rounded-[24px] sm:p-5">
              {balanceLoading || !balanceData ? (
                <div className="text-slate-600">Загрузка...</div>
              ) : (
                <div className="space-y-4 text-[16px] leading-7 text-slate-700 sm:text-[20px] sm:leading-8">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <span className="max-w-[190px] sm:max-w-none">
                      Ожидает поступления:
                    </span>
                    <span className="shrink-0 text-[18px] font-bold text-slate-700 sm:text-xl">
                      {balanceData.pending}р.
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <span className="max-w-[190px] sm:max-w-none">
                      Текущий баланс на вывод:
                    </span>
                    <span className="shrink-0 text-[18px] font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      {balanceData.current}р.
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="max-w-[190px] sm:max-w-none">
                      Отправлено на вывод:
                    </span>
                    <span className="shrink-0 text-[18px] font-bold text-slate-900 sm:text-lg">
                      {balanceData.withdraw}р.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => (window.location.href = "/balance")}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-6 text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 hover:shadow-[0_0_20px_rgba(15,23,42,0.25)] active:scale-[0.98] sm:mt-6 sm:h-14 sm:text-lg"
            >
              Вывести деньги
            </button>
          </section>

          <section className="rounded-[26px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:rounded-[28px] sm:p-8">
            <h2 className="mb-5 text-[30px] font-bold leading-none tracking-tight text-slate-900 sm:mb-6 sm:text-3xl">
              Проверка статуса отзыва
            </h2>

            <div className="space-y-4">
              <input
                value={reviewId}
                onChange={(e) => setReviewId(e.target.value)}
                placeholder="Введите ID отзыва"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:shadow-[0_0_0_4px_rgba(148,163,184,0.14)] sm:h-14 sm:px-5 sm:text-[17px]"
              />

              <button
                onClick={handleCheckStatus}
                disabled={statusLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-6 text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 hover:shadow-[0_0_20px_rgba(15,23,42,0.25)] active:scale-[0.98] disabled:opacity-50 sm:h-14 sm:text-lg"
              >
                {statusLoading ? "Проверяем..." : "Проверить статус"}
              </button>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 shadow-inner sm:rounded-[24px] sm:p-5">
                <div className="mb-2 text-[20px] font-bold text-slate-900 sm:text-xl">
                  Реферальная программа
                </div>
                <div className="mb-4 text-[15px] leading-6 text-slate-600 sm:text-[16px]">
                  Приглашайте друзей и получайте 10 руб
                </div>

                <button
                  onClick={() => setReferralModalOpen(true)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-slate-50 sm:h-11 sm:w-auto sm:text-sm"
                >
                  Подробнее
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="https://t.me/mikhail_managers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[20px] border border-slate-200 bg-white/80 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-white sm:rounded-[22px]"
                >
                  <div className="mb-3 text-[18px] font-bold text-slate-900 sm:text-lg">
                    Поддержка
                  </div>
                  <div className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)] sm:w-auto">
                    Перейти
                  </div>
                </a>

                <a
                  href="https://t.me/+Xw-kkI6yW4sxOWJi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[20px] border border-slate-200 bg-white/80 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-white sm:rounded-[22px]"
                >
                  <div className="mb-3 text-[18px] font-bold text-slate-900 sm:text-lg">
                    Чат исполнителей
                  </div>
                  <div className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)] sm:w-auto">
                    Перейти
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {statusModalOpen && statusData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-lg rounded-[26px] border border-white/70 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:rounded-[30px] sm:p-6">
            <h3 className="mb-5 text-[26px] font-bold tracking-tight text-slate-900 sm:mb-6 sm:text-3xl">
              Статус вашего отзыва
            </h3>

            <div className="space-y-4 sm:space-y-5">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[22px]">
                <div className="mb-2 text-sm text-slate-500">
                  Статус вашего отзыва:
                </div>
                <div className="whitespace-pre-wrap break-words text-[15px] leading-6 font-medium text-slate-800">
                  {statusData.fb_status}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[22px]">
                <div className="mb-2 text-sm text-slate-500">Дата статуса:</div>
                <div className="font-medium text-slate-800">{statusData.status_date}</div>
              </div>

              <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-700 sm:rounded-[22px]">
                <div className="mb-2 font-semibold">Сроки проверки:</div>
                <div>- 5–6 дней — для большинства заданий.</div>
                <div>- До 24 часов — 2ГИС, ВКонтакте.</div>
                <div className="mt-3">
                  Если ваш отзыв на проверке больше 7 дней — напишите @mikhail_managers
                </div>
              </div>

              <button
                onClick={() => setStatusModalOpen(false)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {balanceInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border border-white/70 bg-white p-4 shadow-[0_28px_70px_rgba(15,23,42,0.22)] sm:rounded-[32px] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6 sm:items-center">
              <h3 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-3xl">
                Подробнее о балансе
              </h3>

              <button
                onClick={() => setBalanceInfoOpen(false)}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50 sm:h-11 sm:px-5"
              >
                Закрыть
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[24px] sm:p-5">
                <div className="mb-3 text-[20px] font-bold text-slate-900 sm:text-xl">
                  Разделы баланса
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-700 sm:space-y-4">
                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-semibold">
                      1) Задания по отзывам и активностям
                    </div>
                    <div>
                      Сюда включены задания, которые требуют проверки модератором на момент опубликования отзыва. Если отзыв, оставленный на определённой платформе, прошёл проверку, то исполнитель получает вознаграждение. Подробнее читайте в разделе «Этапы начисления».
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-semibold">2) Реферальная программа</div>
                    <div>
                      Здесь мы учитываем награждение за приглашённых друзей, а также некоторые задания, которые не требуют проверки модератором. Например, это задания на активность, этапы Яндекс или Авито.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[24px] sm:p-5">
                <div className="mb-3 text-[20px] font-bold text-slate-900 sm:text-xl">
                  Этапы начисления
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-700 sm:space-y-4">
                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-semibold">Ожидает поступления</div>
                    <div>
                      Вознаграждение за задания, которые находятся на проверке. Модератор проверяет задания до 5–6 дней. Если ваше задание выполнено верно или отзыв опубликован, то эта сумма переходит в «текущий баланс на вывод». Если отзыв не прошёл или задание выполнено неверно, сумма сгорает.
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-semibold">Текущий баланс на вывод</div>
                    <div>Сумма, которую вы можете вывести.</div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 font-semibold">
                      Отправленная на вывод сумма
                    </div>
                    <div>
                      Это средства, которые менеджер переводит на ваши реквизиты. Если реквизиты указаны неверно и перевод невозможно сделать, то сумма обнулится и вернётся обратно в «текущий баланс на вывод».
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[24px] sm:p-5">
                <div className="mb-3 text-[20px] font-bold text-slate-900 sm:text-xl">
                  Другие вопросы
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    ▫ Вывод на минимальную сумму из двух разделов не суммируется.
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    ▫ За выводом по реферальной программе обращайтесь к @mikhail_managers.
                  </div>
                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    ▫ Время обработки заявки на вывод средств составляет от 1 до 3 дней.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {referralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:rounded-[30px] sm:p-6">
            <h3 className="mb-4 text-[24px] font-bold tracking-tight text-slate-900 sm:text-2xl">
              Реферальная программа
            </h3>

            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-slate-700 sm:rounded-[22px]">
              Скоро будет добавлено
            </div>

            <button
              onClick={() => setReferralModalOpen(false)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
