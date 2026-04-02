import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = process.env.RATING_SMART_TOKEN;

  const res = await fetch(
    `${API_BASE}/twogis/getfreefeedback/${body.userIdText}/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  return NextResponse.json({
    ok: true,
    data: {
      result: data?.result,
      fb_id: data?.result,
      id_yandex_site: data?.result,
    },
  });
}