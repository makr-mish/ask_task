import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  const { userIdText, fb_id } = await req.json();
  const token = process.env.RATING_SMART_TOKEN;

  await fetch(`${API_BASE}/updatefeedback/${userIdText}/${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fb_id,
      fb_status: "Без исполнителя",
    }),
  });

  return NextResponse.json({ ok: true });
}