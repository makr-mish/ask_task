import type { PlatformAdapter } from "@/lib/task-engine/types";

export const dreamJobAdapter: PlatformAdapter = {
  platformSlug: "dream-job",
  getPreviewImages: () => ({
    regionHelpImage:
      "https://pbt.storage.yandexcloud.net/cp_upload/867545d5fcd68fa8e73a2e7c59f3b1d2_full.png",
  }),
  getRewardText: (platform) => platform.ui?.rewardText ?? `${platform.price}₽`,
  getReviewStatusLabel: () => "На проверке модератора",
};