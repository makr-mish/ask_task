import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  getAdminCookieName,
  verifyAdminSessionValue,
} from "@/lib/admin-auth";
import AdminFreeReviews from "@/components/AdminFreeReviews";

export const runtime = "nodejs";

type StatRow = {
  total: number;
};

type PlatformRow = {
  platform: string | null;
  opens: number;
  started: number;
  assigned: number;
  submitted: number;
};

type EventRow = {
  id: number;
  user_id: string;
  platform: string | null;
  event_type: string;
  created_at: string | Date;
};

type DailyRow = {
  day: string | Date;
  visits: number;
  started: number;
  assigned: number;
  submitted: number;
};

type PlatformOptionRow = {
  platform: string | null;
};

type SearchParams = {
  dateFrom?: string;
  dateTo?: string;
  platform?: string;
};

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("ru-RU");
}

function formatDateOnly(value: string | Date | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("ru-RU");
}

function getEventLabel(eventType: string) {
  const map: Record<string, string> = {
    dashboard_visit: "Зашел в кабинет",
    tasks_open: "Открыл раздел заданий",
    task_page_open: "Открыл страницу задания",
    task_request_started: "Начал брать задание",
    task_assigned: "Получил задание",
    task_submit: "Отправил на проверку",
    task_reset: "Сбросил задание",
    task_error: "Ошибка",
  };

  return map[eventType] || eventType;
}

function normalizeDate(value?: string) {
  if (!value) return "";
  return value.trim();
}

function buildWhere(filters: string[]) {
  return filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSessionValue(sessionValue)) {
    redirect("/admin-login");
  }

  const resolvedSearchParams = (await searchParams) || {};

  const dateFrom = normalizeDate(resolvedSearchParams.dateFrom);
  const dateTo = normalizeDate(resolvedSearchParams.dateTo);
  const platform = normalizeDate(resolvedSearchParams.platform);

  const filters: string[] = [];
  const params: Array<string> = [];

  if (dateFrom) {
    filters.push("created_at >= ?");
    params.push(`${dateFrom} 00:00:00`);
  }

  if (dateTo) {
    filters.push("created_at <= ?");
    params.push(`${dateTo} 23:59:59`);
  }

  if (platform) {
    filters.push("platform = ?");
    params.push(platform);
  }

  const baseWhere = buildWhere(filters);

  const [platformOptionsRows] = await db.query(
    `
    SELECT DISTINCT platform
    FROM task_events
    WHERE platform IS NOT NULL
      AND platform <> ''
    ORDER BY platform ASC
    `,
  );

  const [totalVisitsRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    ${
      baseWhere
        ? `${baseWhere} AND event_type = 'dashboard_visit'`
        : "WHERE event_type = 'dashboard_visit'"
    }
    `,
    params,
  );

  const [totalStartedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    ${
      baseWhere
        ? `${baseWhere} AND event_type = 'task_request_started'`
        : "WHERE event_type = 'task_request_started'"
    }
    `,
    params,
  );

  const [totalAssignedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    ${
      baseWhere
        ? `${baseWhere} AND event_type = 'task_assigned'`
        : "WHERE event_type = 'task_assigned'"
    }
    `,
    params,
  );

  const [totalSubmittedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    ${
      baseWhere
        ? `${baseWhere} AND event_type = 'task_submit'`
        : "WHERE event_type = 'task_submit'"
    }
    `,
    params,
  );

  const [uniqueUsersRows] = await db.query(
    `
    SELECT COUNT(DISTINCT user_id) as total
    FROM task_events
    ${baseWhere}
    `,
    params,
  );

  const platformFilters = filters.filter((item) => item !== "platform = ?");
  const platformParams =
    platform && filters.includes("platform = ?")
      ? params.filter((value) => value !== platform)
      : [...params];

  const platformWhere = buildWhere([
    ...platformFilters,
    "platform IS NOT NULL",
    "platform <> ''",
  ]);

  const [platformRows] = await db.query(
    `
    SELECT
      platform,
      SUM(CASE WHEN event_type = 'task_page_open' THEN 1 ELSE 0 END) as opens,
      SUM(CASE WHEN event_type = 'task_request_started' THEN 1 ELSE 0 END) as started,
      SUM(CASE WHEN event_type = 'task_assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN event_type = 'task_submit' THEN 1 ELSE 0 END) as submitted
    FROM task_events
    ${platformWhere}
    GROUP BY platform
    ORDER BY submitted DESC, assigned DESC, started DESC, opens DESC
    `,
    platformParams,
  );

  const [latestRows] = await db.query(
    `
    SELECT id, user_id, platform, event_type, created_at
    FROM task_events
    ${baseWhere}
    ORDER BY created_at DESC
    LIMIT 50
    `,
    params,
  );

  const [dailyRows] = await db.query(
    `
    SELECT
      DATE(created_at) as day,
      SUM(CASE WHEN event_type = 'dashboard_visit' THEN 1 ELSE 0 END) as visits,
      SUM(CASE WHEN event_type = 'task_request_started' THEN 1 ELSE 0 END) as started,
      SUM(CASE WHEN event_type = 'task_assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN event_type = 'task_submit' THEN 1 ELSE 0 END) as submitted
    FROM task_events
    ${baseWhere}
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 30
    `,
    params,
  );

  const totalVisits = (totalVisitsRows as StatRow[])[0]?.total ?? 0;
  const totalStarted = (totalStartedRows as StatRow[])[0]?.total ?? 0;
  const totalAssigned = (totalAssignedRows as StatRow[])[0]?.total ?? 0;
  const totalSubmitted = (totalSubmittedRows as StatRow[])[0]?.total ?? 0;
  const uniqueUsers = (uniqueUsersRows as StatRow[])[0]?.total ?? 0;

  const conversionAssigned =
    totalStarted > 0 ? Math.round((totalAssigned / totalStarted) * 100) : 0;

  const conversionSubmitted =
    totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0;

  const platformOptions = (platformOptionsRows as PlatformOptionRow[])
    .map((row) => row.platform)
    .filter((value): value is string => Boolean(value));

  const activeFilterCount = [dateFrom, dateTo, platform].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
<div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold text-slate-900">Админка ASK TASK</h1>
    <p className="mt-1 text-slate-500">
      Статистика по исполнителям и заданиям
    </p>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row">
    <a
      href="/admin/tickets"
      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Тикеты поддержки
    </a>

    <form action="/api/admin/logout" method="post">
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Выйти
      </button>
    </form>
  </div>
</div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Фильтры</h2>

            {activeFilterCount > 0 && (
              <a
                href="/admin"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Сбросить фильтры
              </a>
            )}
          </div>

          <form method="GET" className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Дата от
              </label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Дата до
              </label>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Платформа
              </label>
              <select
                name="platform"
                defaultValue={platform}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="">Все платформы</option>
                {platformOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Применить
              </button>
            </div>
          </form>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">
              {activeFilterCount > 0 ? "Заходов по фильтру" : "Заходов сегодня"}
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{totalVisits}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">
              {activeFilterCount > 0
                ? "Уникальных пользователей"
                : "Уникальных пользователей сегодня"}
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{uniqueUsers}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Начали брать задание</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{totalStarted}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Выдано заданий</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{totalAssigned}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Отправлено на проверку</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{totalSubmitted}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Конверсия в выдачу</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {conversionAssigned}%
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Конверсия в отправку</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {conversionSubmitted}%
            </div>
          </div>
        </div>

        <AdminFreeReviews />

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            По платформам
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">Платформа</th>
                  <th className="px-3 py-3">Открыли</th>
                  <th className="px-3 py-3">Начали</th>
                  <th className="px-3 py-3">Выдано</th>
                  <th className="px-3 py-3">Отправлено</th>
                  <th className="px-3 py-3">Конверсия</th>
                </tr>
              </thead>
              <tbody>
                {(platformRows as PlatformRow[]).length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={6}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  (platformRows as PlatformRow[]).map((row, index) => {
                    const conversion =
                      row.assigned > 0
                        ? Math.round((row.submitted / row.assigned) * 100)
                        : 0;

                    return (
                      <tr
                        key={`${row.platform}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {row.platform || "—"}
                        </td>
                        <td className="px-3 py-3">{row.opens}</td>
                        <td className="px-3 py-3">{row.started}</td>
                        <td className="px-3 py-3">{row.assigned}</td>
                        <td className="px-3 py-3">{row.submitted}</td>
                        <td className="px-3 py-3">{conversion}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">По дням</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">Дата</th>
                  <th className="px-3 py-3">Заходы</th>
                  <th className="px-3 py-3">Начали</th>
                  <th className="px-3 py-3">Выдано</th>
                  <th className="px-3 py-3">Отправлено</th>
                </tr>
              </thead>
              <tbody>
                {(dailyRows as DailyRow[]).length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  (dailyRows as DailyRow[]).map((row, index) => (
                    <tr
                      key={`${String(row.day)}-${index}`}
                      className="border-b border-slate-100"
                    >
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {formatDateOnly(row.day)}
                      </td>
                      <td className="px-3 py-3">{row.visits}</td>
                      <td className="px-3 py-3">{row.started}</td>
                      <td className="px-3 py-3">{row.assigned}</td>
                      <td className="px-3 py-3">{row.submitted}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Последние события
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">Время</th>
                  <th className="px-3 py-3">Пользователь</th>
                  <th className="px-3 py-3">Платформа</th>
                  <th className="px-3 py-3">Событие</th>
                </tr>
              </thead>
              <tbody>
                {(latestRows as EventRow[]).length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={4}>
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  (latestRows as EventRow[]).map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-3 py-3">{formatDateTime(row.created_at)}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {row.user_id}
                      </td>
                      <td className="px-3 py-3">{row.platform || "—"}</td>
                      <td className="px-3 py-3">{getEventLabel(row.event_type)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}