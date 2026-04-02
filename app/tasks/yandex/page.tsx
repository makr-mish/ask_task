"use client";

import UniversalTaskEngine from "@/app/src/components/tasks/engine/UniversalTaskEngine";
import { getPlatformBySlug } from "@/lib/platforms";

export default function YandexTaskPage() {
  const platform = getPlatformBySlug("yandex");

  if (!platform) {
    return null;
  }

  return <UniversalTaskEngine platform={platform} />;
}