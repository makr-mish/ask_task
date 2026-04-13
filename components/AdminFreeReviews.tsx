"use client";

import { useEffect, useState } from "react";
import { PLATFORMS } from "@/lib/platforms";

type Item = {
  key: string;
  label: string;
  value: number;
};

export default function AdminFreeReviews() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const visiblePlatforms = PLATFORMS.filter((p) => p.key !== "BANKS_RU");

        const results = await Promise.all(
          visiblePlatforms.map(async (platform) => {
            try {
              const res = await fetch(
                `/api/free/${platform.path}?userId=1`,
                {
                  method: "GET",
                  cache: "no-store",
                },
              );

              const json = await res.json().catch(() => null);

              if (!res.ok) {
                return null;
              }

              const data = json?.data;

              let rawValue: unknown = 0;

              if (
                data &&
                typeof data === "object" &&
                "result" in data
              ) {
                rawValue = (data as { result?: unknown }).result ?? 0;
              } else if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                (data as { data?: unknown }).data &&
                typeof (data as { data?: unknown }).data === "object" &&
                "result" in ((data as { data: { result?: unknown } }).data)
              ) {
                rawValue = (data as { data: { result?: unknown } }).data.result ?? 0;
              } else {
                rawValue = data ?? 0;
              }

              const numericValue = Number(rawValue);

              if (!Number.isFinite(numericValue) || numericValue <= 0) {
                return null;
              }

              return {
                key: platform.key,
                label: platform.label,
                value: numericValue,
              };
            } catch {
              return null;
            }
          }),
        );

        if (cancelled) return;

        const filtered = results
          .filter((item): item is Item => Boolean(item))
          .sort((a, b) => b.value - a.value);

        setItems(filtered);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Свободные отзывы
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Показаны только платформы, где осталось больше 5 отзывов
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">
          Сейчас нет платформ, где осталось больше 5 отзывов
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="text-sm text-slate-500">{item.label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}