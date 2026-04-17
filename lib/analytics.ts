export type AnalyticsEventType =
  | "dashboard_visit"
  | "tasks_open"
  | "task_page_open"
  | "task_request_started"
  | "task_assigned"
  | "task_submit"
  | "task_reset"
  | "task_error"
  | "presence_ping";

type TrackEventPayload = {
  userId: string;
  eventType: AnalyticsEventType;
  platform?: string | null;
  eventData?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackEventPayload) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.error("Analytics track error:", error);
  }
}