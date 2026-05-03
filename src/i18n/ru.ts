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
  "admin.nav.sessions": "Журнал сессий",
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

  "admin.sessions.title": "Журнал сессий",
  "admin.sessions.subtitle": "История диалогов и фильтрация по пользователям, датам и веткам.",
  "admin.sessions.empty": "Нет сессий по заданным фильтрам.",
  "admin.sessions.error": "Не удалось загрузить список сессий.",
  "admin.sessions.loading": "Обновляем список…",
  "admin.sessions.loadMore": "Показать ещё",
  "admin.sessions.loadingMore": "Загружаем…",

  "admin.sessions.filters.label": "Фильтры списка сессий",
  "admin.sessions.filters.user_id": "ID пользователя",
  "admin.sessions.filters.user_id.placeholder": "UUID пользователя",
  "admin.sessions.filters.started_from": "С",
  "admin.sessions.filters.started_to": "По",
  "admin.sessions.filters.has_errors": "Только с ошибками",
  "admin.sessions.filters.min_messages": "Минимум сообщений",
  "admin.sessions.filters.max_messages": "Максимум сообщений",
  "admin.sessions.filters.branch": "Ветки роутера",
  "admin.sessions.filters.branch.placeholder": "Введите и нажмите Enter",
  "admin.sessions.filters.branch.remove": "Удалить ветку",
  "admin.sessions.filters.reset": "Сбросить",

  "admin.sessions.column.id": "ID",
  "admin.sessions.column.user_id": "Пользователь",
  "admin.sessions.column.started_at": "Начало",
  "admin.sessions.column.last_activity_at": "Активность",
  "admin.sessions.column.message_count": "Сообщений",
  "admin.sessions.column.error_count": "Ошибок",
  "admin.sessions.column.branches": "Ветки",

  "admin.sessionDetail.title": "Сессия",
  "admin.sessionDetail.subtitle": "Подробности появятся в Stage F5.",
  "admin.sessionDetail.id": "Идентификатор",
  "admin.sessionDetail.stub":
    "Здесь появится водопад этапов, сообщения и панели LLM/Tools/RAG (Stage F5).",
  "admin.sessionDetail.back": "Назад к списку",

  "testchat.title": "Тест-чат",
  "testchat.nav.chat": "Чат",
  "testchat.page.title": "Тест-чат",
  "testchat.page.stub": "Содержимое появится в Stage F10.",
} as const;

export type RuKey = keyof typeof ru;
