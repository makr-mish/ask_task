import type { PlatformAdapter } from "@/lib/task-engine/types";

export const appStoreAdapter: PlatformAdapter = {
  platformSlug: "banki", // slug как в platforms.ts

  getPreviewImages: () => ({
    phoneExampleImage: "/examples/app-store-phone.jpg",
    siteExampleImage: "/examples/app-store-site.jpg",
  }),

  getRewardText: (platform) => `${platform.price}₽`,
};