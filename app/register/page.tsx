"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  async function handleRegister() {
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Ошибка регистрации");
        return;
      }

      setSuccessModalOpen(true);
      setLogin("");
      setPassword("");
    } catch (error) {
      console.error(error);
      alert("Ошибка сервера");
    } finally {
      setLoading(false);
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
              Регистрация
            </h1>

            <p className="mt-3 text-[15px] leading-6 text-slate-600">
              Создайте логин и пароль для входа в личный кабинет.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
            <div className="mb-1 text-[13px] font-semibold text-slate-500">
              Новый аккаунт
            </div>

            <h2 className="text-[22px] font-bold text-slate-900">
              Создание профиля
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Регистрация займет меньше минуты.
            </p>

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
                onClick={handleRegister}
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-6 text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Создание..." : "Зарегистрироваться"}
              </button>

              <button
                onClick={() => router.push("/login")}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 text-[16px] font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
              >
                Уже есть аккаунт
              </button>
            </div>
          </div>
        </section>
      </div>

      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-center text-[24px] font-bold tracking-tight text-slate-900">
              Успешно
            </h3>

            <p className="mt-3 text-center text-[15px] leading-6 text-slate-600">
              Аккаунт создан. Теперь можно войти в личный кабинет.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-black px-6 text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-[1px] hover:from-slate-700 hover:to-slate-900 active:scale-[0.98]"
              >
                Перейти ко входу
              </button>

              <button
                onClick={() => setSuccessModalOpen(false)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-[16px] font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}