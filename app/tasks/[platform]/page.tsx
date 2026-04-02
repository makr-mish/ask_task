"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlatformBySlug } from "@/lib/platforms";
import UniversalTaskEngine from "@/app/src/components/tasks/engine/UniversalTaskEngine";

export default function UniversalTaskPage() {
  const params = useParams();
  const router = useRouter();

  const slug = useMemo(() => {
    const raw = params?.platform;
    return Array.isArray(raw) ? raw[0] : String(raw || "");
  }, [params]);

  const platform = getPlatformBySlug(slug);

  if (!platform) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-black">Платформа не найдена</h1>
          <p className="mt-3 text-gray-600">Такой платформы пока нет в конфиге.</p>
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

  return <UniversalTaskEngine platform={platform} />;
}