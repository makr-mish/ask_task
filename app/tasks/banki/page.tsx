"use client";

import { getPlatformBySlug } from "@/lib/platforms";
import UniversalTaskEngine from "@/app/src/components/tasks/engine/UniversalTaskEngine";

export default function AppStoreTaskPage() {
  const platform = getPlatformBySlug("banki");

  if (!platform) {
    return <div>Платформа banki не найдена</div>;
  }

  return <UniversalTaskEngine platform={platform} />;
}