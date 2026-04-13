"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  userId?: string;
  platform?: string;
};

export default function TaskAnalytics({ userId, platform }: Props) {
  useEffect(() => {
    if (!userId) return;

    void trackEvent({
      userId,
      eventType: "task_page_open",
      platform,
    });
  }, [userId, platform]);

  return null;
}
