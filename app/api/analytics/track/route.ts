export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Body = {
  userId?: string;
  eventType?: string;
  platform?: string | null;
  eventData?: Record<string, unknown>;
};

function normalizeNullableString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const userId = String(body.userId ?? "").trim();
    const eventType = String(body.eventType ?? "").trim();
    const platform = body.platform ? String(body.platform).trim() : null;
    const eventData = body.eventData ?? null;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "userId и eventType обязательны" },
        { status: 400 }
      );
    }

    await db.query(
      `
      INSERT INTO task_events (user_id, platform, event_type, event_data)
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        platform,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
      ]
    );

    if (eventType === "task_submit") {
      const feedbackId = normalizeNullableString(
        eventData && "feedbackId" in eventData ? eventData.feedbackId : null
      );
      const fbId = normalizeNullableString(
        eventData && "fbId" in eventData ? eventData.fbId : null
      );
      const reviewId = feedbackId ?? fbId;

      if (reviewId) {
        await db.query(
          `
          INSERT INTO completed_tasks (user_id, platform, feedback_id, fb_id, completed_at)
          VALUES (?, ?, ?, ?, NOW())
          `,
          [userId, platform, feedbackId, fbId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ANALYTICS TRACK ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка записи аналитики" },
      { status: 500 }
    );
  }
}