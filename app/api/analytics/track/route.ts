export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Body = {
  userId?: string;
  eventType?: string;
  platform?: string | null;
  eventData?: Record<string, unknown>;
};

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ANALYTICS TRACK ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка записи аналитики" },
      { status: 500 }
    );
  }
}