"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const telegramModalRef = useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

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
    script.setAttribute("data-telegram-login", "Alplha_bot");
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
      localStorage.setItem("token", String(data.token));

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
        <section className="w-full rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
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
                Используйте ваш Telegram-аккаунт для быстрого входа
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