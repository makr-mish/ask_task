export async function initUser() {
  let userId = localStorage.getItem("user_id");
  let token = localStorage.getItem("token");

  // если уже есть — просто вернуть
  if (userId && token) {
    return { userId, token };
  }

  // если открыто в Telegram
  if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    const initData = tg.initData;

    if (initData) {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initData }),
      });

      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("token", data.token);

        return {
          userId: data.user.id,
          token: data.token,
        };
      }
    }
  }

  // fallback — обычный пользователь
  const res = await fetch("/api/auth/guest", {
    method: "POST",
  });

  const data = await res.json();

  localStorage.setItem("user_id", data.user.id);
  localStorage.setItem("token", data.token);

  return {
    userId: data.user.id,
    token: data.token,
  };
}