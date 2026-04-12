import { NextResponse } from "next/server";

const TIMEOUT_MS = 8000;

function withTimeout(signal?: AbortSignal) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const startedAt = Date.now();

  try {
    const { platform } = await context.params;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    const token = process.env.API_TOKEN || process.env.RATING_SMART_TOKEN;
    const base = process.env.API_BASE;

    if (!token || !base) {
      return NextResponse.json(
        {
          error: "Env vars are missing",
          tokenExists: !!token,
          baseExists: !!base,
        },
        { status: 500 },
      );
    }

    const backendUrl = `${base}/feedbacks/free/${platform}/${userId}/${token}`;
    const timeout = withTimeout();

    try {
      const res = await fetch(backendUrl, {
        method: "GET",
        cache: "no-store",
        signal: timeout.signal,
      });

      const text = await res.text();

      let data: unknown = text;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      console.log(
        `[free:${platform}] user=${userId} status=${res.status} time=${Date.now() - startedAt}ms`,
      );

      return NextResponse.json(
        {
          ok: res.ok,
          status: res.status,
          data,
        },
        { status: res.ok ? 200 : res.status },
      );
    } finally {
      timeout.clear();
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    const isAbortError =
      error instanceof Error &&
      (error.name === "AbortError" || message.toLowerCase().includes("abort"));

    console.error(
      `[free] failed after ${Date.now() - startedAt}ms`,
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: isAbortError ? "Timeout while loading free tasks" : message,
      },
      { status: isAbortError ? 504 : 500 },
    );
  }
}