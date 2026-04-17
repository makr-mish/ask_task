"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  userId?: string | null;
};

const HEARTBEAT_MS = 60_000;

export default function AnalyticsProvider({ userId }: Props) {
  useEffect(() => {
    if (!userId) return;

    void trackEvent({
      userId,
      eventType: "dashboard_visit",
    });

    void trackEvent({
      userId,
      eventType: "presence_ping",
    });

    const interval = window.setInterval(() => {
      void trackEvent({
        userId,
        eventType: "presence_ping",
      });
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [userId]);

  return null;
}
