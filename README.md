# Предмет — AI-студия товаров

Самостоятельное веб-приложение по ТЗ AI-STUDIO-TZ.md. Реализован **только этап 0**: каркас и инструменты разработки. Регистрация, загрузки, анализ, очередь, кредиты и генерация пока не реализованы. AI_PROVIDER=mock задаёт безопасную конфигурацию будущего провайдера; демонстрационная генерация появится на этапе 4.

Исходный Telegram-бот в родительской папке не используется и не изменён.

## Требования

- Node.js 24 LTS, npm 11 (версии зависимостей зафиксированы в package-lock.json).
- Docker Desktop с Compose v2 для PostgreSQL, либо свой PostgreSQL 17.
- Для браузерных тестов — Chromium, устанавливаемый Playwright.
- Платные ключи не требуются.

## Установка и запуск — Windows PowerShell

Откройте папку ai-studio в VS Code, затем терминал в этой папке:

```powershell
npm.cmd ci
Copy-Item .env.example .env
```

Команду копирования выполняйте только при первом запуске, когда .env ещё нет.
Замените replace_with_local_password в POSTGRES_PASSWORD и DATABASE_URL на одинаковый локальный пароль. Спецсимволы в URL кодируйте. Реальные ключи не добавляйте. Затем:

```powershell
docker compose up -d --wait
npm.cmd run db:deploy
npm.cmd run db:check
npm.cmd run dev
```

Откройте http://localhost:3000. Остановка приложения: Ctrl+C.
Остановка базы без удаления данных: `docker compose down`.

npm.cmd используется, чтобы стандартная политика PowerShell не блокировала npm.ps1.
Если порт 5432 занят, измените POSTGRES_PORT и порт в DATABASE_URL.
Если Docker отсутствует, установите Docker Desktop и запустите его либо задайте DATABASE_URL своей базы.
Стартовую страницу этапа 0 можно посмотреть без базы: `npm.cmd ci`, затем `npm.cmd run dev`. Это не проверяет миграции.

## macOS / Linux

```bash
npm ci
cp .env.example .env
# Замените пароль в двух переменных .env.
docker compose up -d --wait
npm run db:deploy
npm run db:check
npm run dev
```

## Проверки

```powershell
npm.cmd run check
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

check: форматирование, ESLint, Prisma validate, строгая проверка TypeScript, unit-тесты.
Сборка и тесты страницы не требуют работающей базы или AI-ключей.
Playwright сам запускает production-сервер на порту 3100; этот порт должен быть свободен.
Проверяются HTTP 200, русский интерфейс, навигация клавиатурой, отсутствие горизонтального переполнения и ошибок консоли на 360 и 1440 px.
Скриншоты сохраняются в test-results, HTML-отчёт — в playwright-report.

```powershell
npm.cmd run format
npm.cmd run test:watch
npm.cmd run db:generate
npm.cmd run db:migrate -- --name describe_change
```

db:migrate — для разработки новых миграций, db:deploy — для применения сохранённых.
Начальная миграция создаёт только таблицу User; авторизация и остальные сущности появятся на следующих этапах.
db:check проверяет соединение и наличие таблицы через Prisma, не выводит строку подключения.

## Production-сборка локально

```powershell
npm.cmd run build
npm.cmd run start
```

Приложение доступно на http://localhost:3000. Compose сейчас поднимает только PostgreSQL, Next.js работает на хосте.
Публичное развёртывание не входит в этап 0.

## Структура

```text
src/
  app/                  # App Router: страница, layout, стили
  shared/
    config/env.ts       # Zod-валидация серверного окружения
    db/client.ts        # Ленивый серверный Prisma-клиент
    i18n/ru.ts          # Русские тексты
  generated/prisma/     # Генерируется, не хранится в Git
prisma/
  schema.prisma
  migrations/           # Начальная PostgreSQL-миграция
scripts/check-db.ts
tests/
  unit/env.test.ts
  e2e/home.spec.ts
compose.yaml
prisma.config.ts
vitest.config.mts
playwright.config.ts
```

TypeScript strict включён. Next.js 16, React 19, Tailwind 4, Prisma 7 с PostgreSQL-адаптером.
Prisma Client создаётся при npm ci и перед сборкой/проверкой типов.
.env исключён из Git; .env.example включён. База слушает только localhost, данные лежат в Docker volume.
Внешние шрифты и платные AI-запросы отсутствуют.

## Ручная проверка этапа 0

1. Запустите приложение по инструкции, откройте главную страницу.
2. Убедитесь, что виден текст о подготовительной версии и будущих функциях.
3. На ширине 360 px блоки расположены в колонку и текст не обрезан.
4. Нажмите Tab: логотип получает видимый фокус; Enter открывает главную.
5. Выполните db:deploy и db:check на чистой PostgreSQL-базе.
6. Выполните check, build и test:e2e.

## Отличия от видео и план

Референс: https://youtu.be/M4yuY3AvdvU. Сценарий взят из предоставленного ТЗ; содержимое видео напрямую проверить не удалось.
Собственное рабочее название «Предмет», тексты и оформление. Сейчас это подготовительный каркас, а не функциональный аналог сервиса из видео.

Следующие этапы: авторизация и кабинет → проекты/загрузка → анализ и подтверждение фактов → mock-очередь/кредиты/результаты → реальный серверный AI-адаптер → полное тестирование MVP.
Реальные платежи, видео, примерка и OAuth остаются за рамками MVP.

## Результаты проверки в среде разработки

- Production-сборка, ESLint, Prisma validate, TypeScript strict и 5 unit-тестов прошли.
- Playwright: 2 теста прошли в Microsoft Edge на ширинах 360 и 1440 px; скриншоты визуально проверены. Команда завершилась с кодом 0 вне песочницы.
- Docker отсутствует: запуск Compose, применение миграции на чистой базе и db:check пока не проверены.
- Загрузка Chromium с CDN завершилась сетевыми тайм-аутами. Для установленного Edge используйте:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm.cmd run test:e2e
```

Без этой переменной используется стандартный Chromium Playwright.

- npm audit сообщает 4 high-уязвимости в цепочке Prisma 7.10.0 (deepmerge-ts и mysql2, включая родительские пакеты). Они видны и с --omit=dev из-за зависимостей/peer-зависимостей Prisma. Автоматический --force не применялся: он предлагает несовместимый переход на Prisma 6. Это незакрытый пункт перед production; проект сейчас предназначен для локальной разработки.
