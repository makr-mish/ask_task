"use client";

import { useEffect, useState } from "react";
import { PLATFORMS } from "@/lib/platforms";

type AppUser = {
  USER_ID_TEXT: string;
  first_name: string;
  username?: string;
};

type TgUser = {
  USER_ID_TEXT: string;
  first_name: string;
  username?: string;
};

type FreeItem = {
  key: string;
  label: string;
  path: string;
  status: "idle" | "loading" | "success" | "error";
  value: string;
  httpStatus?: number;
  errorText?: string;
  timeMs?: number;
};

export default function FreeDebugPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [items, setItems] = useState<FreeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const visiblePlatforms = PLATFORMS.filter((p) => p.key !== "BANKS_RU");

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
    const initialItems: FreeItem[] = visiblePlatforms.map((platform) => ({
      key: platform.key,
      label: platform.label,
      path: platform.path,
      status: "idle",
      value: "—",
    }));

    setItems(initialItems);
  }, []);

  const updateItem = (key: string, patch: Partial<FreeItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const loadOne = async (key: string, path: string) => {
    if (!user) return;

    updateItem(key, {
      status: "loading",
      value: "Загрузка...",
      errorText: "",
      httpStatus: undefined,
      timeMs: undefined,
    });

    const startedAt = Date.now();

    try {
      const res = await fetch(
        `/api/free/${path}?userId=${encodeURIComponent(user.USER_ID_TEXT)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const json = await res.json().catch(() => null);
      const timeMs = Date.now() - startedAt;

      if (!res.ok) {
        updateItem(key, {
          status: "error",
          value: "Ошибка",
          httpStatus: res.status,
          errorText: json?.error || json?.message || "Ошибка запроса",
          timeMs,
        });
        return;
      }

      const data = json?.data;

      let value = "0";

      if (
        data &&
        typeof data === "object" &&
        "result" in data &&
        data.result !== undefined &&
        data.result !== null
      ) {
        value = String(data.result);
      } else if (typeof data === "number" || typeof data === "string") {
        value = String(data);
      } else if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        data.data &&
        typeof data.data === "object" &&
        "result" in data.data &&
        data.data.result !== undefined &&
        data.data.result !== null
      ) {
        value = String(data.data.result);
      }

      updateItem(key, {
        status: "success",
        value,
        httpStatus: res.status,
        errorText: "",
        timeMs,
      });
    } catch (error) {
      updateItem(key, {
        status: "error",
        value: "Ошибка",
        errorText: error instanceof Error ? error.message : "Неизвестная ошибка",
        timeMs: Date.now() - startedAt,
      });
    }
  };

  const loadAll = async () => {
    if (!user) return;

    setLoading(true);

    try {
      for (const platform of visiblePlatforms) {
        await loadOne(platform.key, platform.path);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && items.length > 0) {
      void loadAll();
    }
  }, [user, items.length]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 16px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          Проверка свободных заданий
        </h1>

        <p style={{ marginBottom: 8 }}>
          <b>User ID:</b>{" "}
          {user ? user.USER_ID_TEXT : "не найден"}
        </p>

        <p style={{ marginBottom: 24, color: "#475569" }}>
          Эта страница нужна только для проверки, что именно приходит с сервера.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => void loadAll()}
            disabled={loading || !user}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Обновление..." : "Обновить все"}
          </button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.key}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: 16,
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {item.label}
                  </div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>
                    path: {item.path}
                  </div>
                </div>

                <button
                  onClick={() => void loadOne(item.key, item.path)}
                  style={{
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Обновить
                </button>
              </div>

              <div style={{ marginTop: 16, fontSize: 18 }}>
                <b>Значение:</b> {item.value}
              </div>

              <div style={{ marginTop: 8, color: "#475569" }}>
                <div>
                  <b>Статус:</b> {item.status}
                </div>
                <div>
                  <b>HTTP:</b> {item.httpStatus ?? "—"}
                </div>
                <div>
                  <b>Время:</b> {item.timeMs ? `${item.timeMs} ms` : "—"}
                </div>
                <div>
                  <b>Ошибка:</b> {item.errorText || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}