import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  getAdminCookieName,
  verifyAdminSessionValue,
} from "@/lib/admin-auth";

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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSessionValue(sessionValue)) {
    redirect("/admin-login");
  }

  const [todayVisitsRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    WHERE event_type = 'dashboard_visit'
      AND DATE(created_at) = CURDATE()
    `,
  );

  const [todayStartedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    WHERE event_type = 'task_request_started'
      AND DATE(created_at) = CURDATE()
    `,
  );

  const [todayAssignedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    WHERE event_type = 'task_assigned'
      AND DATE(created_at) = CURDATE()
    `,
  );

  const [todaySubmittedRows] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM task_events
    WHERE event_type = 'task_submit'
      AND DATE(created_at) = CURDATE()
    `,
  );

  const [todayUsersRows] = await db.query(
    `
    SELECT COUNT(DISTINCT user_id) as total
    FROM task_events
    WHERE DATE(created_at) = CURDATE()
    `,
  );

  const [platformRows] = await db.query(
    `
    SELECT
      platform,
      SUM(CASE WHEN event_type = 'task_page_open' THEN 1 ELSE 0 END) as opens,
      SUM(CASE WHEN event_type = 'task_request_started' THEN 1 ELSE 0 END) as started,
      SUM(CASE WHEN event_type = 'task_assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN event_type = 'task_submit' THEN 1 ELSE 0 END) as submitted
    FROM task_events
    WHERE created_at >= NOW() - INTERVAL 30 DAY
      AND platform IS NOT NULL
      AND platform <> ''
    GROUP BY platform
    ORDER BY submitted DESC, assigned DESC, started DESC
    `,
  );

  const [latestRows] = await db.query(
    `
    SELECT id, user_id, platform, event_type, created_at
    FROM task_events
    ORDER BY created_at DESC
    LIMIT 30
    `,
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
    WHERE created_at >= CURDATE() - INTERVAL 7 DAY
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    `,
  );

  const todayVisits = (todayVisitsRows as StatRow[])[0]?.total ?? 0;
  const todayStarted = (todayStartedRows as StatRow[])[0]?.total ?? 0;
  const todayAssigned = (todayAssignedRows as StatRow[])[0]?.total ?? 0;
  const todaySubmitted = (todaySubmittedRows as StatRow[])[0]?.total ?? 0;
  const todayUsers = (todayUsersRows as StatRow[])[0]?.total ?? 0;

  const conversionAssigned =
    todayStarted > 0 ? Math.round((todayAssigned / todayStarted) * 100) : 0;

  const conversionSubmitted =
    todayAssigned > 0 ? Math.round((todaySubmitted / todayAssigned) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Админка ASK TASK</h1>
            <p className="mt-1 text-slate-500">Статистика по исполнителям и заданиям</p>
          </div>

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Выйти
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Заходов сегодня</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{todayVisits}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Уникальных пользователей сегодня</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{todayUsers}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Начали брать задание</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{todayStarted}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Выдано заданий</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{todayAssigned}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Отправлено на проверку</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{todaySubmitted}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Конверсия в выдачу</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{conversionAssigned}%</div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Конверсия в отправку</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{conversionSubmitted}%</div>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">По платформам за 30 дней</h2>

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
                {(platformRows as PlatformRow[]).map((row, index) => {
                  const conversion =
                    row.assigned > 0
                      ? Math.round((row.submitted / row.assigned) * 100)
                      : 0;

                  return (
                    <tr key={`${row.platform}-${index}`} className="border-b border-slate-100">
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
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">По дням за 7 дней</h2>

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
                {(dailyRows as DailyRow[]).map((row, index) => (
                  <tr key={`${String(row.day)}-${index}`} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {formatDateOnly(row.day)}
                    </td>
                    <td className="px-3 py-3">{row.visits}</td>
                    <td className="px-3 py-3">{row.started}</td>
                    <td className="px-3 py-3">{row.assigned}</td>
                    <td className="px-3 py-3">{row.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Последние события</h2>

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
                {(latestRows as EventRow[]).map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{formatDateTime(row.created_at)}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">{row.user_id}</td>
                    <td className="px-3 py-3">{row.platform || "—"}</td>
                    <td className="px-3 py-3">{row.event_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}