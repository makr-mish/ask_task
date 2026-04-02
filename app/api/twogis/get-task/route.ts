import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    answer: "Откройте 2GIS и выполните задание",
  });
}