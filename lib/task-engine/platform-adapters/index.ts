import type { PlatformAdapter } from "@/lib/task-engine/types";
import { yandexAdapter } from "./yandex";
import { yandexBrowserAdapter } from "./yandex-browser";
import { yandexUslugiAdapter } from "./yandex-uslugi";
import { googleMapsAdapter } from "./google-maps";
import { vkAdapter } from "./vk";
import { googlePlayAdapter } from "./google-play";
import { appStoreAdapter } from "./app-store";
import { flampAdapter } from "./flamp";
import { zoonAdapter } from "./zoon";
import { yellAdapter } from "./yell";
import { twogisAdapter } from "./twogis";
import { dreamJobAdapter } from "./dream-job";

const PLATFORM_ADAPTERS: Record<string, PlatformAdapter> = {
  [yandexAdapter.platformSlug]: yandexAdapter,
  [yandexBrowserAdapter.platformSlug]: yandexBrowserAdapter,
  [yandexUslugiAdapter.platformSlug]: yandexUslugiAdapter,
  [googleMapsAdapter.platformSlug]: googleMapsAdapter,
  [vkAdapter.platformSlug]: vkAdapter,
  [googlePlayAdapter.platformSlug]: googlePlayAdapter,
  [appStoreAdapter.platformSlug]: appStoreAdapter,
  [flampAdapter.platformSlug]: flampAdapter,
  [zoonAdapter.platformSlug]: zoonAdapter,
  [yellAdapter.platformSlug]: yellAdapter,
  [twogisAdapter.platformSlug]: twogisAdapter,
  [dreamJobAdapter.platformSlug]: dreamJobAdapter,
};

export function getPlatformAdapter(slug: string): PlatformAdapter | null {
  return PLATFORM_ADAPTERS[slug] ?? null;
}