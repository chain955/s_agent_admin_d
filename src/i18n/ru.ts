// Flat dictionary, ru-only on MVP. Keys are dotted paths, values are strings.
// Architecture supports more locales later (see FRONTEND_CLAUDE.md §10).
export const ru = {
  "app.brand": "Sport Agent",

  "login.title": "Вход",
  "login.subtitle": "Войдите учётной записью администратора.",

  "auth.login": "Логин",
  "auth.password": "Пароль",
  "auth.submit": "Войти",
  "auth.submitting": "Входим…",
  "auth.logout": "Выйти",
  "auth.error.required": "Поле обязательно для заполнения.",
  "auth.error.invalid": "Неверный логин или пароль.",
  "auth.error.network": "Не удалось связаться с сервером.",
  "auth.error.generic": "Не удалось войти. Попробуйте ещё раз.",

  "theme.toggle": "Переключить тему",
  "theme.toDark": "Тёмная тема",
  "theme.toLight": "Светлая тема",

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
