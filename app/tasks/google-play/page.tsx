"use client";

import { getPlatformBySlug } from "@/lib/platforms";
import UniversalTaskEngine from "@/app/src/components/tasks/engine/UniversalTaskEngine";

export default function GooglePlayTaskPage() {
  const platform = getPlatformBySlug("google-play");

  if (!platform) {
    return <div>Платформа google-play не найдена</div>;
  }

  return <UniversalTaskEngine platform={platform} />;
}