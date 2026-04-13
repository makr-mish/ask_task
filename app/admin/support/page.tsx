"use client";

import { useEffect, useState } from "react";

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

export default function SupportPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successText, setSuccessText] = useState("");

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

  const handleSubmit = async () => {
    if (!user) return;

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanSubject || !cleanMessage) {
      alert("Заполните тему и сообщение");
      return;
    }

    setLoading(true);
    setSuccessText("");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.USER_ID_TEXT,
          subject: cleanSubject,
          message: cleanMessage,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        alert(json?.error || "Не удалось отправить тикет");
        return;
      }

      setSubject("");
      setMessage("");
      setSuccessText("Обращение отправлено в поддержку");
    } catch (error) {
      console.error("SUPPORT SUBMIT ERROR:", error);
      alert("Не удалось отправить тикет");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          Загрузка...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Поддержка</h1>
              <p className="mt-1 text-slate-500">
                Напишите свой вопрос или проблему
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Назад
            </button>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Тема
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Например: Проблема с заданием"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-[15px] outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Сообщение
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите вопрос как можно подробнее"
                rows={8}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none transition focus:border-slate-400"
              />
            </div>

            {successText && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successText}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-[15px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Отправляем..." : "Отправить тикет"}
              </button>

              <a
                href="https://t.me/mikhail_managers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Написать в Telegram
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}