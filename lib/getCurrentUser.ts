export type CurrentUser = {
  USER_ID_TEXT: string;
  first_name?: string;
  username?: string;
};

export function getCurrentUser(): CurrentUser | null {
  const rawTgUser = localStorage.getItem("tg_user");
  const userId = localStorage.getItem("user_id");

  if (rawTgUser) {
    try {
      const parsed = JSON.parse(rawTgUser);
      return {
        USER_ID_TEXT: String(parsed.USER_ID_TEXT),
        first_name: parsed.first_name || "Telegram user",
        username: parsed.username || "",
      };
    } catch {
      localStorage.removeItem("tg_user");
    }
  }

  if (userId) {
    return {
      USER_ID_TEXT: String(userId),
      first_name: "Пользователь",
      username: "",
    };
  }

  return null;
}