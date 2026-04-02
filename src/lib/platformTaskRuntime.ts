export type PlatformTaskRuntimeConfig = {
  rewardText: string;
  title: string;
  formIntro: string;
};

export const PLATFORM_TASK_RUNTIME_CONFIG: Record<string, PlatformTaskRuntimeConfig> = {
  yandex: {
    rewardText: "130₽",
    title: "Яндекс Карты",
    formIntro: "Заполните данные аккаунта, чтобы получить ID отзыва.",
  },
  "yandex-browser": {
    rewardText: "100₽",
    title: "Яндекс Браузер",
    formIntro: "Заполните данные аккаунта, чтобы получить задание.",
  },
  google: {
    rewardText: "100₽",
    title: "Google Карты",
    formIntro: "Платформа подготовлена к подключению через общий движок.",
  },
};

export function getPlatformTaskRuntimeConfig(platform: string) {
  return PLATFORM_TASK_RUNTIME_CONFIG[platform] ?? null;
}
