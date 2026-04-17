"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  userId?: string;
  platform?: string;
};

const HEARTBEAT_MS = 60_000;

export default function TaskAnalytics({ userId, platform }: Props) {
  useEffect(() => {
    if (!userId) return;

    void trackEvent({
      userId,
      eventType: "task_page_open",
      platform,
    });

    void trackEvent({
      userId,
      eventType: "presence_ping",
      platform,
    });

    const interval = window.setInterval(() => {
      void trackEvent({
        userId,
        eventType: "presence_ping",
        platform,
      });
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [userId, platform]);

  return null;
}
