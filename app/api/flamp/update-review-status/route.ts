import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  const { userIdText, fb_id, fb_status } = await req.json();
  const token = process.env.RATING_SMART_TOKEN;

  const res = await fetch(
    `${API_BASE}/updatefeedback/${userIdText}/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fb_id, fb_status }),
    }
  );

  const data = await res.json();

  return NextResponse.json({ ok: true, result: data?.result });
}