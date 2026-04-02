import type { PlatformAdapter } from "@/lib/task-engine/types";

export const googlePlayAdapter: PlatformAdapter = {
  platformSlug: "google-play",

  getPreviewImages: () => ({
    phoneExampleImage: "/examples/google-play-phone.jpg",
    siteExampleImage: "/examples/google-play-site.jpg",
  }),

  getRewardText: (platform) => `${platform.price}₽`,
};