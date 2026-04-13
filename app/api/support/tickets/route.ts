export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Body = {
  userId?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const userId = String(body.userId ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: "Заполните тему и сообщение" },
        { status: 400 },
      );
    }

    await db.query(
      `
      INSERT INTO support_tickets (user_id, subject, message)
      VALUES (?, ?, ?)
      `,
      [userId, subject, message],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SUPPORT TICKET CREATE ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось отправить тикет" },
      { status: 500 },
    );
  }
}