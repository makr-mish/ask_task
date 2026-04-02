import type { PlatformAdapter } from "@/lib/task-engine/types";

export const yandexBrowserAdapter: PlatformAdapter = {
  platformSlug: "yandex-browser",
  getPreviewImages: () => ({}),
  getRewardText: (platform) => platform.ui?.rewardText ?? `${platform.price}₽`,
  getReviewStatusLabel: () => "На проверке модератора",
};