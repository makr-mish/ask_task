import { getPlatformBySlug } from "@/lib/platforms";

export type ClientPostOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export type ClientApiError = Error & {
  status?: number;
  data?: any;
};

export async function clientApiRequest<T>(
  url: string,
  options: ClientPostOptions = {},
): Promise<T> {
  const method = options.method ?? "POST";

  console.log("[clientApiRequest] request:", {
    url,
    method,
    body: options.body ?? {},
  });

  const res = await fetch(url, {
    method,
    headers:
      method === "POST"
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    body: method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
  });

  const data = await res.json().catch(() => null);

  console.log("[clientApiRequest] response:", {
    url,
    status: res.status,
    ok: res.ok,
    data,
  });

  if (!res.ok) {
    const error: ClientApiError = new Error(
      data?.error || data?.message || `Ошибка запроса: ${res.status}`,
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  if (data && typeof data === "object" && "ok" in data && data.ok === false) {
    const error: ClientApiError = new Error(
      data?.error || data?.message || "Ошибка выполнения запроса",
    );
    error.status = data?.code ?? res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export type GetFeedbackPayload = {
  userIdText: string;
  gender: string;
  telegram_id: string;
  telegram_username: string;
  account_name: string;
  amount: string;
  region: string;
};

export type GetTaskPayload = {
  userIdText: string;
  fb_id: string;
};

export type GetControlQuestionPayload = {
  userIdText: string;
  fb_id: string;
  default_id: string;
};

export type GetReviewTextPayload = {
  userIdText: string;
  id_yandex_site: string;
};

export type UpdateReviewStatusPayload = {
  userIdText: string;
  fb_id: string;
  fb_status: string;
};

export type NormalizedFeedbackResponse = {
  feedbackId: string;
  fbId: string;
  siteId: string;
  raw: any;
};

export type NormalizedTaskResponse = {
  taskText: string;
  raw: any;
};

export type NormalizedControlQuestionResponse = {
  question: string;
  raw: any;
};

export type NormalizedReviewTextResponse = {
  text: string;
  raw: any;
};

export type NormalizedUpdateReviewStatusResponse = {
  resultId: string;
  raw: any;
};

function extractResult(data: any): string {
  return String(
    data?.data?.raw?.result ??
      data?.raw?.result ??
      data?.data?.result ??
      data?.result ??
      "",
  ).trim();
}

function extractMessage(data: any): string {
  return String(
    data?.data?.raw?.message ??
      data?.raw?.message ??
      data?.data?.message ??
      data?.message ??
      data?.error ??
      data?.data?.error ??
      "Ошибка получения задания",
  ).trim();
}

export function getPlatformApi(platform: string) {
  const config = getPlatformBySlug(platform);

  console.log("[getPlatformApi]", {
    platform,
    hasConfig: Boolean(config),
    api: config?.api ?? null,
  });

  return config?.api ?? null;
}

export async function getFeedback(
  platform: string,
  payload: GetFeedbackPayload,
): Promise<NormalizedFeedbackResponse> {
  console.log("[getFeedback] input:", {
    platform,
    payload,
  });

  const api = getPlatformApi(platform);

  if (!api?.getFeedback) {
    throw new Error(`Для платформы ${platform} не настроен getFeedback`);
  }

  try {
    const data: any = await clientApiRequest(api.getFeedback, { body: payload });

    console.log("[getFeedback] raw response:", data);

    const resultValue = extractResult(data);
    const errorMessage = extractMessage(data);

    if (resultValue === "400") {
      throw new Error(errorMessage);
    }

    const fbId = String(
      data?.data?.fb_id ?? data?.fb_id ?? data?.feedback_id ?? "",
    ).trim();

    if (!fbId || fbId === "400") {
      throw new Error(errorMessage || "Не удалось получить fb_id");
    }

    const fbIdNumber = Number(fbId);

    if (Number.isFinite(fbIdNumber) && fbIdNumber < 399) {
      throw new Error("Свободных отзывов сейчас нет. Попробуйте позже.");
    }

    let siteId = "";

    if (platform === "yandex-browser") {
      siteId = String(
        data?.data?.id_yandex_browser ??
          data?.id_yandex_browser ??
          data?.data?.browser_id ??
          data?.browser_id ??
          "",
      ).trim();
    } else {
      siteId = String(
        data?.data?.id_yandex_site ??
          data?.id_yandex_site ??
          data?.data?.site_id ??
          data?.site_id ??
          "",
      ).trim();
    }

    if (!siteId || siteId === "400") {
      throw new Error(errorMessage || "Не удалось получить ID платформы");
    }

    console.log("[getFeedback] normalized:", {
      feedbackId: fbId,
      fbId,
      siteId,
    });

    return {
      feedbackId: fbId,
      fbId,
      siteId,
      raw: data,
    };
  } catch (error) {
    const err = error as ClientApiError;

    if (err.status === 404) {
      throw new Error(
        err.data?.error || "Свободных отзывов сейчас нет. Попробуйте позже.",
      );
    }

    throw error;
  }
}

export async function getTask(
  platform: string,
  payload: GetTaskPayload,
): Promise<NormalizedTaskResponse> {
  console.log("[getTask] input:", {
    platform,
    payload,
  });

  const api = getPlatformApi(platform);

  if (!api?.getTask) {
    throw new Error(`Для платформы ${platform} не настроен getTask`);
  }

  const data: any = await clientApiRequest(api.getTask, { body: payload });

  console.log("[getTask] raw response:", data);

  const resultValue = extractResult(data);
  const errorMessage = extractMessage(data);

  if (resultValue === "400") {
    throw new Error(errorMessage);
  }

  const taskText = String(
    data?.dealQuestion?.answer ??
      data?.answer ??
      data?.data?.answer ??
      data?.link_post ??
      data?.data?.link_post ??
      "",
  ).trim();

  console.log("[getTask] normalized:", {
    taskText,
  });

  if (!taskText) {
    throw new Error("Не удалось получить текст задания");
  }

  return {
    taskText,
    raw: data,
  };
}

export async function getControlQuestion(
  platform: string,
  payload: GetControlQuestionPayload,
): Promise<NormalizedControlQuestionResponse> {
  console.log("[getControlQuestion] input:", {
    platform,
    payload,
  });

  const api = getPlatformApi(platform);

  if (!api?.getControlQuestion) {
    throw new Error(`Для платформы ${platform} не настроен getControlQuestion`);
  }

  const data: any = await clientApiRequest(api.getControlQuestion, {
    body: payload,
  });

  console.log("[getControlQuestion] raw response:", data);

  const question = String(
    data?.data?.dealQuestion?.question ??
      data?.dealQuestion?.question ??
      data?.question ??
      "",
  ).trim();

  console.log("[getControlQuestion] normalized:", {
    question,
  });

  if (!question) {
    throw new Error("Не удалось получить текст контрольного вопроса");
  }

  return {
    question,
    raw: data,
  };
}

export async function getReviewText(
  platform: string,
  payload: GetReviewTextPayload,
): Promise<NormalizedReviewTextResponse> {
  console.log("[getReviewText] input:", {
    platform,
    payload,
  });

  const api = getPlatformApi(platform);

  if (!api?.getReviewText) {
    throw new Error(`Для платформы ${platform} не настроен getReviewText`);
  }

  const data: any = await clientApiRequest(api.getReviewText, { body: payload });

  console.log("[getReviewText] raw response:", data);

  const text = String(
    data?.fb_text ??
      data?.data?.fb_text ??
      data?.result?.fb_text ??
      data?.data?.result?.fb_text ??
      "",
  ).trim();

  console.log("[getReviewText] normalized:", {
    text,
  });

  if (!text) {
    throw new Error("Текст отзыва пустой");
  }

  return {
    text,
    raw: data,
  };
}

export async function updateReviewStatus(
  platform: string,
  payload: UpdateReviewStatusPayload,
): Promise<NormalizedUpdateReviewStatusResponse> {
  console.log("[updateReviewStatus] input:", {
    platform,
    payload,
  });

  const api = getPlatformApi(platform);

  if (!api?.updateReviewStatus) {
    throw new Error(
      `Для платформы ${platform} не настроен updateReviewStatus`,
    );
  }

  const data: any = await clientApiRequest(api.updateReviewStatus, {
    body: payload,
  });

  console.log("[updateReviewStatus] raw response:", data);

  const resultId = String(data?.result ?? data?.data?.result ?? payload.fb_id);

  console.log("[updateReviewStatus] normalized:", {
    resultId,
  });

  return {
    resultId,
    raw: data,
  };
}