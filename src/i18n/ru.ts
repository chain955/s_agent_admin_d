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
  "admin.dashboard.subtitle": "Состояние сервисов и статистика за выбранный период.",
  "admin.dashboard.loading": "Загрузка…",
  "admin.dashboard.error": "Не удалось загрузить данные.",
  "admin.dashboard.empty": "Нет данных за выбранный период.",

  "admin.dashboard.health.section": "Состояние сервисов",
  "admin.dashboard.health.postgres": "Postgres",
  "admin.dashboard.health.redis": "Redis",
  "admin.dashboard.health.llm": "LLM-бэкенд",
  "admin.dashboard.health.embeddings": "Эмбеддинги",
  "admin.dashboard.health.ok": "В норме",
  "admin.dashboard.health.degraded": "Деградация",
  "admin.dashboard.health.down": "Недоступен",
  "admin.dashboard.health.unknown": "Нет данных",

  "admin.dashboard.range.label": "Диапазон дат",
  "admin.dashboard.range.from": "С",
  "admin.dashboard.range.to": "По",
  "admin.dashboard.range.invalid": "Дата начала должна быть не позже даты конца.",

  "admin.dashboard.stats.section": "Статистика",
  "admin.dashboard.stats.sessions": "Сессии в день",
  "admin.dashboard.stats.avgResponse": "Среднее время ответа",
  "admin.dashboard.stats.branches": "Распределение веток роутера",
  "admin.dashboard.stats.errors": "Ошибки в день",

  "testchat.title": "Тест-чат",
  "testchat.nav.chat": "Чат",
  "testchat.page.title": "Тест-чат",
  "testchat.page.stub": "Содержимое появится в Stage F10.",
} as const;

export type RuKey = keyof typeof ru;
