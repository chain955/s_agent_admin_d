// Flat dictionary, ru-only on MVP. Keys are dotted paths, values are strings.
// Architecture supports more locales later (see FRONTEND_CLAUDE.md §10).
export const ru = {
  "app.brand": "Sport Agent",

  "login.title": "Вход",

  "admin.title": "Админ",
  "admin.nav.dashboard": "Дашборд",
  "admin.dashboard.title": "Дашборд",
  "admin.dashboard.stub": "Содержимое появится в Stage F3.",

  "testchat.title": "Тест-чат",
  "testchat.nav.chat": "Чат",
  "testchat.page.title": "Тест-чат",
  "testchat.page.stub": "Содержимое появится в Stage F10.",
} as const;

export type RuKey = keyof typeof ru;
