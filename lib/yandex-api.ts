const API_BASE = "https://lk.rating-smart.ru:8080/api/bot";

function extractApiMessage(data: any): string {
  return (
    data?.data?.raw?.message ||
    data?.raw?.message ||
    data?.data?.message ||
    data?.message ||
    data?.error ||
    data?.raw?.error ||
    data?.data?.error ||
    ""
  );
}

function extractApiResult(data: any): string | number | undefined {
  return (
    data?.data?.raw?.result ??
    data?.raw?.result ??
    data?.data?.result ??
    data?.result
  );
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Некорректный JSON от сервера: ${text}`);
  }

  const apiMessage = extractApiMessage(data);
  const apiResult = extractApiResult(data);

  if (!res.ok) {
    throw new Error(
      apiMessage || `Ошибка внешнего API: ${res.status} ${res.statusText}`,
    );
  }

  if (String(apiResult) === "400") {
    throw new Error(apiMessage || "Внешний API вернул ошибку 400");
  }

  return data as T;
}

export { API_BASE };