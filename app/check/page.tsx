export default function Page() {
  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 page-fade">
        <section className="premium-border rounded-[32px]">
          <div className="glass-card grid-glow overflow-hidden rounded-[32px] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="badge-premium float-soft mb-4 inline-flex items-center rounded-full border border-white/70 px-4 py-1.5 text-xs font-semibold text-slate-500">
                  Личный кабинет
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Добро пожаловать, Михаил
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                  Управляйте балансом, проверяйте статусы отзывов и берите новые задания
                  в одном аккуратном современном интерфейсе.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <div className="hover-premium rounded-[24px] border border-white/80 bg-white/65 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Профиль
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-800">Михаил</p>
                  </div>

                  <div className="hover-premium rounded-[24px] border border-white/80 bg-white/65 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      ID пользователя
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-800">1675234601</p>
                  </div>

                  <div className="hover-premium rounded-[24px] border border-white/80 bg-white/65 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Username
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-800">
                      mikhail_managers
                    </p>
                  </div>
                </div>
              </div>

              <button className="btn-premium badge-premium inline-flex h-12 items-center justify-center rounded-2xl border border-white/80 px-5 text-sm font-semibold text-slate-700 hover:bg-white/90">
                Выйти
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="fade-1 premium-border rounded-[30px]">
            <div className="glass-card overflow-hidden rounded-[30px] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Баланс</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Актуальная информация по начислениям и выводу средств
                  </p>
                </div>

                <button className="btn-premium badge-premium inline-flex h-11 items-center justify-center rounded-2xl border border-white/80 px-4 text-sm font-semibold text-slate-700 hover:bg-white/90">
                  Подробнее
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="hover-premium shimmer rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50/90 via-white to-white p-5 shadow-[0_12px_32px_rgba(245,158,11,0.08)]">
                  <p className="text-sm text-slate-500">Ожидает поступления</p>
                  <p className="mt-5 text-4xl font-black tracking-tight text-slate-900">
                    450₽
                  </p>
                </div>

                <div className="hover-premium shimmer rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-white p-5 shadow-[0_12px_32px_rgba(16,185,129,0.08)]">
                  <p className="text-sm text-slate-500">Текущий баланс на вывод</p>
                  <p className="mt-5 text-4xl font-black tracking-tight text-slate-900">
                    1957₽
                  </p>
                </div>

                <div className="hover-premium shimmer rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50/90 via-white to-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                  <p className="text-sm text-slate-500">Отправлено на вывод</p>
                  <p className="mt-5 text-4xl font-black tracking-tight text-slate-900">
                    0₽
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-2 premium-border rounded-[30px]">
            <div className="glass-card overflow-hidden rounded-[30px] p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Проверка статуса отзыва</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Введите ID отзыва, чтобы быстро узнать его текущий статус
                </p>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/55 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  ID отзыва
                </label>

                <input
                  type="text"
                  placeholder="Например: 123456789"
                  className="input-premium h-14 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-base outline-none placeholder:text-slate-400 focus:border-indigo-400"
                />

                <button className="btn-premium glow-live mt-4 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-base font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] hover:opacity-95">
                  Проверить статус
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-3 mt-6 premium-border rounded-[32px]">
          <div className="glass-card overflow-hidden rounded-[32px] p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Доступные задания</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Выберите площадку и начните выполнение доступного задания
                </p>
              </div>

              <button className="btn-premium badge-premium inline-flex h-11 items-center justify-center rounded-2xl border border-white/80 px-4 text-sm font-semibold text-slate-700 hover:bg-white/90">
                Обновить
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Авито
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 5</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    200₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium shimmer rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white/80 via-white/70 to-emerald-50/70 p-5 shadow-[0_14px_35px_rgba(16,185,129,0.10)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Яндекс Карты
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 0</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    130₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="btn-premium glow-live inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] hover:opacity-95">
                    Взять задание
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Яндекс Браузер
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 2</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    100₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Яндекс Услуги
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 0</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    100₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Google Карты
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 10</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    100₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Вконтакте
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 0</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    50₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Flamp
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 0</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    50₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>

              <div className="hover-premium rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[2rem] font-bold tracking-tight text-slate-900">
                      Banki
                    </h3>
                    <p className="mt-2 text-base text-slate-500">Свободно: 0</p>
                  </div>

                  <span className="badge-premium rounded-full px-3 py-1 text-sm font-bold text-slate-700">
                    50₽
                  </span>
                </div>

                <div className="mt-8">
                  <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500">
                    Скоро
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}