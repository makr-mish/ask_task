import type { PlatformAdapter } from "@/lib/task-engine/types";

export const yandexAdapter: PlatformAdapter = {
  platformSlug: "yandex",
  getPreviewImages: () => ({
    phoneExampleImage:
      "https://pbt.storage.yandexcloud.net/cp_upload/3694531906861d70b164b76caa42556d_full.jpg",
    siteExampleImage:
      "https://i.postimg.cc/R0xPXRMP/eeee52ee92574100ac2f22590b4af6ec-full-(3).jpg",
    regionHelpImage:
      "https://pbt.storage.yandexcloud.net/cp_upload/867545d5fcd68fa8e73a2e7c59f3b1d2_full.png",
  }),
  getRewardText: (platform) => platform.ui?.rewardText ?? `${platform.price}₽`,
  getReviewStatusLabel: () => "На проверке модератора",
};