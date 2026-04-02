import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  const { userIdText, id_yandex_site } = await req.json();
  const token = process.env.RATING_SMART_TOKEN;

  const res = await fetch(
    `${API_BASE}/getfeedback/${userIdText}/${token}/${id_yandex_site}`
  );

  const data = await res.json();

  return NextResponse.json({
    ok: true,
    fb_text: data?.fb_text ?? "",
    raw: data,
  });
}