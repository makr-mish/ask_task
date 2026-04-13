"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  userId?: string | null;
};

export default function AnalyticsProvider({ userId }: Props) {
  useEffect(() => {
    if (!userId) return;

    void trackEvent({
      userId,
      eventType: "dashboard_visit",
    });
  }, [userId]);

  return null;
}