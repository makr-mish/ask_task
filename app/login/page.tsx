"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

type ActivityItem = {
  text: string;
  reward: number;
};

type ActivityToast = {
  id: number;
  userId: number;
  text: string;
  reward: number;
  isVisible: boolean;
};

const ACTIVITY_ITEMS: ActivityItem[] = [
  { text: 'опубликовал отзыв на "Доске объявлений"', reward: 200 },
  { text: "оставил отзыв в Яндекс Картах", reward: 130 },
  { text: "оставил отзыв в Яндекс Браузере", reward: 100 },
  { text: "оставил отзыв в Яндекс Услугах", reward: 100 },
  { text: "оставил отзыв в Google Картах", reward: 100 },
  { text: "оставил отзыв ВКонтакте", reward: 50 },
  { text: "оставил отзыв на Flamp", reward: 50 },
  { text: "оставил отзыв на Banki.ru", reward: 50 },
  { text: "оставил отзыв на Yell", reward: 50 },
  { text: "оставил отзыв на Dream Job", reward: 50 },
  { text: "оставил отзыв на ProDoctorov", reward: 50 },
  { text: "оставил отзыв в Google Play", reward: 50 },
  { text: "оставил отзыв в 2GIS", reward: 30 },
  { text: "оставил отзыв на Zoon", reward: 50 },
  { text: "оставил отзыв на Otzovik", reward: 50 },

  { text: "выполнил активность: навигация", reward: 6 },
  { text: "выполнил активность: посещение", reward: 5 },
  { text: "выполнил активность: оценки", reward: 5 },
  { text: "выполнил активность: лайки", reward: 2 },
  { text: "выполнил активность: дизлайки", reward: 2 },
  { text: "выполнил активность: подписки", reward: 2 },
  { text: "выполнил активность: бусты", reward: 5 },
  { text: "выполнил активность: комментарии", reward: 5 },
  { text: "выполнил активность: голосование", reward: 2 },
  { text: "выполнил активность: переписка", reward: 5 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandomToast(previousText?: string): ActivityToast {
  let item = ACTIVITY_ITEMS[randomInt(0, ACTIVITY_ITEMS.length - 1)];

  if (ACTIVITY_ITEMS.length > 1 && previousText) {
    let attempts = 0;
    while (item.text === previousText && attempts < 10) {
      item = ACTIVITY_ITEMS[randomInt(0, ACTIVITY_ITEMS.length - 1)];
      attempts += 1;
    }
  }

  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    userId: randomInt(1000, 9999),
    text: item.text,
    reward: item.reward,
    isVisible: true,
  };
}

export default function LoginPage() {
  const router = useRouter();
  const telegramModalRef = useRef<HTMLDivElement>(null);
  const notificationsTimeoutRef = useRef<number | null>(null);
  const swapTimeoutRef = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [activityToast, setActivityToast] = useState<ActivityToast | null>(null);

  useEffect(() => {
    const tgUser = localStorage.getItem("tg_user");
    const userId = localStorage.getItem("user_id");

    if (tgUser || userId) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    setActivityToast(createRandomToast());
  }, []);

  useEffect(() => {
    if (!activityToast) return;

    let cancelled = false;

    const scheduleNext = () => {
      const delay = randomInt(1000, 8000);

      notificationsTimeoutRef.current = window.setTimeout(() => {
        if (cancelled) return;

        setActivityToast((prev) => {
          if (!prev) return prev;
          return { ...prev, isVisible: false };
        });

        swapTimeoutRef.current = window.setTimeout(() => {
          if (cancelled) return;

          setActivityToast((prev) => createRandomToast(prev?.text));
          scheduleNext();
        }, 450);
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;

      if (notificationsTimeoutRef.current) {
        window.clearTimeout(notificationsTimeoutRef.current);
      }

      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current);
      }
    };
  }, [activityToast?.id]);

  useEffect(() => {
    window.onTelegramAuth = (user) => {
      const normalizedUser = {
        USER_ID_TEXT: String(user.id),
        id: user.id,
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        username: user.username ?? "",
        photo_url: user.photo_url ?? "",
        auth_date: user.auth_date ?? "",
        hash: user.hash ?? "",
      };

      localStorage.setItem("tg_user", JSON.stringify(normalizedUser));
      localStorage.setItem("auth_type", "telegram");
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");

      window.location.href = "/loading-screen";
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  useEffect(() => {
    if (!telegramModalOpen || !telegramModalRef.current) return;

    const container = telegramModalRef.current;
    container.innerHTML = "";
    setLoaded(false);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", "Ask_task_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    script.onload = () => setLoaded(true);

    container.appendChild(script);
  }, [telegramModalOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTelegramModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  async function handlePasswordLogin() {
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }

    try {
      setLoginLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Ошибка входа");
        return;
      }

      localStorage.setItem("user_id", String(data.userId));
      localStorage.setItem("auth_type", "password");
      localStorage.removeItem("tg_user");
      localStorage.removeItem("token");

      router.push("/loading-screen");
    } catch (error) {
      console.error(error);
      alert("Ошибка сервера");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-4 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md items-center">
        <section className="relative w-full rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 min-h-[84px]">
            {activityToast && (
              <div
                key={activityToast.id}
                className={[
                  "rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-md",
                  activityToast.isVisible
                    ? "animate-[activityToastIn_0.45s_ease_forwards]"
                    : "animate-[activityToastOut_0.45s_ease_forwards]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-[13px] font-medium leading-5 text-slate-700">
                    <span className="font-semibold text-slate-900">
                      Пользователь ID {activityToast.userId}
                    </span>{" "}
                    {activityToast.text}
                  </div>

                  <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-bold text-emerald-600">
                    +{activityToast.reward} ₽
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-5">
            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
              ASK TASK
            </div>

            <h1 className="mt-4 text-[34px] font-bold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-[40px]">
              Вход в ASK TASK
            </h1>

            <p className="mt-3 text-[15px] leading-6 text-slate-600">
              Войдите через Telegram или используйте логин и пароль.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setTelegramModalOpen(true)}
              className="w-full rounded-[24px] border border-slate-200 bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-[1px] hover:bg-slate-50 active:scale-[0.99]"
            >
              <div className="mb-1 text-[13px] font-semibold text-slate-500">
                Быстрый вход
              </div>

              <h2 className="text-[22px] font-bold text-slate-900">
                Через Telegram
              </h2>

              <p className="mt-2 text-[14px] leading-6 text-slate-600">
                Рекомендуем, если вы уже входили через бота @ask_task_bot. Ваша
                учетная запись будет синхронизирована, и вы получите доступ ко
                всем своим заданиям и балансу.
              </p>

              <div className="mt-4">
                <div className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#58a8ea_0%,#3b82f6_100%)] px-6 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(88,168,234,0.25)]">
                  Войти через Telegram
                </div>
              </div>
            </button>

            <div className="relative py-1">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
              <div className="relative mx-auto w-fit bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                или
              </div>
            </div>

            <div
              id="password-login-form"
              className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
            >
              <h3 className="text-[22px] font-bold text-slate-900">
                По логину и паролю
              </h3>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-[#eef3fb] px-4 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(148,163,184,0.14)]"
                />

                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-[#eef3fb] px-4 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(148,163,184,0.14)]"
                />

                <button
                  onClick={handlePasswordLogin}
                  disabled={loginLoading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-6 text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 active:scale-[0.98] disabled:opacity-50"
                >
                  {loginLoading ? "Вход..." : "Войти"}
                </button>

                <button
                  onClick={() => router.push("/register")}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 text-[16px] font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  Регистрация
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {telegramModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setTelegramModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Вход через Telegram
              </h3>

              <button
                onClick={() => setTelegramModalOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
              >
                Закрыть
              </button>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-inner">
              <div className="mb-3 text-sm text-slate-500">
                Используйте ваш Telegram-аккаунт для быстрого входа (у вас должен быть включен VPN)
              </div>

              <div ref={telegramModalRef} />

              {!loaded && (
                <p className="mt-3 text-sm text-slate-500">
                  Загрузка кнопки Telegram...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}