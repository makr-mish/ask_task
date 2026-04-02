export type PlatformTaskFeatures = {
phoneCheck: boolean;
siteCheck: boolean;
controlQuestions: boolean;
moderationTimer: boolean;
reviewText: boolean;
};

export type PlatformTaskApi = {
getFeedback: string;
getTask: string;
resetTask: string;
getControlQuestion?: string;
getReviewText?: string;
updateReviewStatus?: string;
};

export type PlatformUiConfig = {
searchLabel: string;
searchQuestion: string;
rewardText: string;
};

export type PlatformConfig = {
key: string;
slug: string;
label: string;
path: string;
price: number;
taskHref: string;
api?: PlatformTaskApi;
features?: PlatformTaskFeatures;
ui?: PlatformUiConfig;
};

export const PLATFORMS: PlatformConfig[] = [
{
key: "avito",
slug: "avito",
label: "Авито",
path: "avito",
price: 200,
taskHref: "/tasks/avito",
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: false,
moderationTimer: false,
reviewText: false,
},
},
{
key: "YANDEX",
slug: "yandex",
label: "Яндекс Карты",
path: "YANDEX",
price: 130,
taskHref: "/tasks/yandex",
api: {
getFeedback: "/api/yandex/get-feedback",
getTask: "/api/yandex/get-task",
resetTask: "/api/yandex/reset-task",
getControlQuestion: "/api/yandex/get-control-question",
getReviewText: "/api/yandex/get-review-text",
updateReviewStatus: "/api/yandex/update-review-status",
},
features: {
phoneCheck: true,
siteCheck: true,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "В поиске Яндекс нужно найти данную организацию:",
searchQuestion: "Получилось найти?",
rewardText: "130₽",
},
},
{
key: "YANDEX_BROWSER",
slug: "yandex-browser",
label: "Яндекс Браузер",
path: "YANDEX_BROWSER",
price: 100,
taskHref: "/tasks/yandex-browser",
api: {
getFeedback: "/api/yandex-browser/get-feedback",
getTask: "/api/yandex-browser/get-task",
resetTask: "/api/yandex-browser/reset-task",
getControlQuestion: "/api/yandex-browser/get-control-question",
getReviewText: "/api/yandex-browser/get-review-text",
updateReviewStatus: "/api/yandex-browser/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "Откройте карточку в Яндекс Браузере:",
searchQuestion: "Получилось открыть карточку?",
rewardText: "100₽",
},
},
{
key: "YANDEX_USLUGI",
slug: "yandex-uslugi",
label: "Яндекс Услуги",
path: "YANDEX_USLUGI",
price: 100,
taskHref: "/tasks/yandex-uslugi",
api: {
getFeedback: "/api/yandex-uslugi/get-feedback",
getTask: "/api/yandex-uslugi/get-task",
resetTask: "/api/yandex-uslugi/reset-task",
getControlQuestion: "/api/yandex-uslugi/get-control-question",
getReviewText: "/api/yandex-uslugi/get-review-text",
updateReviewStatus: "/api/yandex-uslugi/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "Найдите карточку исполнителя в Яндекс Услугах:",
searchQuestion: "Получилось найти?",
rewardText: "100₽",
},
},
{
key: "google",
slug: "google-maps",
label: "Google Карты",
path: "google",
price: 100,
taskHref: "/tasks/google-maps",
api: {
getFeedback: "/api/google-maps/get-feedback",
getTask: "/api/google-maps/get-task",
resetTask: "/api/google-maps/reset-task",
getControlQuestion: "/api/google-maps/get-control-question",
getReviewText: "/api/google-maps/get-review-text",
updateReviewStatus: "/api/google-maps/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "Найдите карточку компании в Google Картах:",
searchQuestion: "Получилось найти?",
rewardText: "100₽",
},
},
{
key: "vk",
slug: "vk",
label: "ВКонтакте",
path: "vk",
price: 100,
taskHref: "/tasks/vk",
api: {
getFeedback: "/api/vk/get-feedback",
getTask: "/api/vk/get-task",
resetTask: "/api/vk/reset-task",
getControlQuestion: "/api/vk/get-control-question",
getReviewText: "/api/vk/get-review-text",
updateReviewStatus: "/api/vk/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "Найдите страницу/карточку задания во ВКонтакте:",
searchQuestion: "Получилось найти?",
rewardText: "100₽",
},
},
{
key: "flamp",
slug: "flamp",
label: "Flamp",
path: "flamp",
price: 100,
taskHref: "/tasks/flamp",
api: {
getFeedback: "/api/flamp/get-feedback",
getTask: "/api/flamp/get-task",
resetTask: "/api/flamp/reset-task",
getControlQuestion: "/api/flamp/get-control-question",
getReviewText: "/api/flamp/get-review-text",
updateReviewStatus: "/api/flamp/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
},

{
key: "zoon",
slug: "zoon",
label: "Zoon",
path: "zoon",
price: 100,
taskHref: "/tasks/zoon",
api: {
getFeedback: "/api/zoon/get-feedback",
getTask: "/api/zoon/get-task",
resetTask: "/api/zoon/reset-task",
getControlQuestion: "/api/zoon/get-control-question",
getReviewText: "/api/zoon/get-review-text",
updateReviewStatus: "/api/zoon/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: true,
moderationTimer: true,
reviewText: true,
},
ui: {
searchLabel: "Найдите карточку компании на Zoon:",
searchQuestion: "Получилось найти?",
rewardText: "100₽",
},
},

{
key: "yell",
slug: "yell",
label: "Yell",
path: "yell",
price: 100,
taskHref: "/tasks/yell",
api: {
getFeedback: "/api/yell/get-feedback",
getTask: "/api/yell/get-task",
resetTask: "/api/yell/reset-task",
getControlQuestion: "/api/yell/get-control-question",
getReviewText: "/api/yell/get-review-text",
updateReviewStatus: "/api/yell/update-review-status",
},
features: {
phoneCheck: false,
siteCheck: false,
controlQuestions: false,
moderationTimer: true,
reviewText: true,
},
},
{
  key: "dream_job",
  slug: "dream-job",
  label: "Dream Job",
  path: "dream_job",
  price: 50,
  taskHref: "/tasks/dream-job",
  api: {
    getFeedback: "/api/dream-job/get-feedback",
    getTask: "/api/dream-job/get-task",
    resetTask: "/api/dream-job/reset-task",
    getControlQuestion: "/api/dream-job/get-control-question",
    getReviewText: "/api/dream-job/get-review-text",
    updateReviewStatus: "/api/dream-job/update-review-status",
  },
  features: {
    phoneCheck: false,
    siteCheck: false,
    controlQuestions: true,
    moderationTimer: true,
    reviewText: true,
  },
  ui: {
    searchLabel: "Найдите карточку компании на Dream Job:",
    searchQuestion: "Получилось найти?",
    rewardText: "50₽",
  },
},

{
  key: "GOOGLE_PLAY",
  slug: "google-play",
  label: "Google Play",
  path: "google_play",
  price: 50,
  taskHref: "/tasks/google-play",
  api: {
    getFeedback: "/api/google-play/get-feedback",
    getTask: "/api/google-play/get-task",
    resetTask: "/api/google-play/reset-task",
  },
  features: {
    phoneCheck: false,
    siteCheck: false,
    controlQuestions: false,
    moderationTimer: false,
    reviewText: true,
  },
},
{
  key: "BANKS_RU",
  slug: "banki",
  label: "App Store",
  path: "BANKS_RU",
  price: 50,
  taskHref: "/tasks/banki",
  api: {
    getFeedback: "/api/banki/get-feedback",
    getTask: "/api/banki/get-task",
    resetTask: "/api/banki/reset-task",
  },
  features: {
    phoneCheck: false,
    siteCheck: false,
    controlQuestions: false,
    moderationTimer: false,
    reviewText: true,
  },
},
{
  key: "twogis",
  slug: "twogis",
  label: "2GIS",
  path: "twogis",
  price: 100,
  taskHref: "/tasks/twogis",
  api: {
    getFeedback: "/api/twogis/get-feedback",
    getTask: "/api/twogis/get-task",
    resetTask: "/api/twogis/reset-task",
    getControlQuestion: "/api/twogis/get-control-question",
    getReviewText: "/api/twogis/get-review-text",
    updateReviewStatus: "/api/twogis/update-review-status",
  },
  features: {
    phoneCheck: false,
    siteCheck: false,
    controlQuestions: false,
    moderationTimer: true,
    reviewText: true,
  },
},
];

export const PLATFORM_PRICE_MAP = Object.fromEntries(
PLATFORMS.map((platform) => [platform.key, platform.price]),
) as Record<string, number>;

export const PLATFORM_MAP = Object.fromEntries(
PLATFORMS.map((platform) => [platform.slug, platform]),
) as Record<string, PlatformConfig>;

export function getPlatformBySlug(slug: string) {
return PLATFORM_MAP[slug] ?? null;
}
