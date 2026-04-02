import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  const { userIdText, fb_id, default_id } = await req.json();
  const token = process.env.RATING_SMART_TOKEN;

  const data = await postJson(
    `${API_BASE}/deal/question/answer/${userIdText}/${token}`,
    { fb_id, default_id }
  );

  return NextResponse.json({ ok: true, data });
}