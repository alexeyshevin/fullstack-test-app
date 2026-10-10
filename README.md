# Items Management — Fullstack Test App

Веб-приложение для работы со списком из 1 000 000 исходных элементов и дополнительных элементов с пользовательскими ID. Элементы можно искать по ID, выбирать, исключать из выбранных и менять порядок выбранных элементов с помощью Drag & Drop.

## Технологии

- **Frontend:** React 19, TypeScript, Vite, Material UI, TanStack Query, dnd-kit.
- **Backend:** Node.js, Express 5, TypeScript, KafkaJS.
- **Общие контракты:** пакет `@app/contracts`.
- **Инфраструктура:** Apache Kafka в Docker Compose.

## Возможности

- Два списка: доступные и выбранные элементы.
- Независимая фильтрация списков по вхождению строки в ID.
- Бесконечная прокрутка с постраничной загрузкой по 20 элементов.
- Добавление элемента с новым положительным целочисленным ID (в пределах безопасного диапазона JavaScript).
- Drag & Drop выбранных элементов, в том числе при активном фильтре.
- Сохранение выбранных элементов и их порядка при обновлении страницы, пока работает backend-процесс.
- Асинхронные команды через Kafka: сервер возвращает `202 Accepted`, клиент отслеживает статус выполнения.
- Пакетная обработка команд добавления с задержкой 10 секунд и команд выбора, снятия выбора и перестановки с задержкой 1 секунды после поступления первой команды в пакет.
- Swagger UI для API.

> Данные приложения хранятся в оперативной памяти backend-процесса и сбрасываются при его перезапуске. Kafka использует собственное хранилище для сообщений; база данных приложения не требуется.

## Структура проекта

```text
apps/
  frontend/       # React-приложение
  backend/        # Express API, Kafka consumer/producer, in-memory store
packages/
  contracts/      # Общие TypeScript-типы и DTO

docker-compose.yml
package.json      # npm workspaces
```

## Требования

- Node.js и npm, совместимые с установленными зависимостями проекта.
- Docker и Docker Compose для запуска Kafka.

## Локальный запуск

Из корня репозитория:

1. Установить зависимости:

   ```bash
   npm install
   ```

2. Собрать общие контракты:

   ```bash
   npm run build -w @app/contracts
   ```

3. Запустить Kafka:

   ```bash
   docker compose up -d kafka
   ```

4. В отдельном терминале запустить backend:

   ```bash
   npm run dev:backend
   ```

5. В другом терминале запустить frontend:

   ```bash
   npm run dev -w frontend
   ```

Откройте адрес, который выведет Vite (обычно `http://localhost:5173`). В режиме разработки запросы `/api` проксируются на `http://localhost:3000`.

Swagger UI: `http://localhost:3000/api/docs`.

По умолчанию backend использует `PORT=3000`, `KAFKA_BROKER=localhost:9092`. Для обращения к API напрямую из frontend можно установить `VITE_API_URL` (по умолчанию `/api`).

## API

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/items` | Доступные элементы; `filter`, `cursor`, `limit` |
| POST | `/api/items` | Добавить элемент |
| GET | `/api/selected` | Выбранные элементы; `filter`, `cursor`, `limit` |
| POST | `/api/selected/select` | Выбрать элемент |
| POST | `/api/selected/unselect` | Снять выбор |
| POST | `/api/selected/reorder` | Изменить порядок выбранных элементов |
| GET | `/api/commands/:commandId` | Получить статус асинхронной команды |
| GET | `/api/docs` | Swagger UI |

Максимальный размер страницы — 20 элементов. Для мутаций API возвращает `commandId`, по которому можно получить статус `accepted`, `processing`, `completed` или `failed`.

## Проверка и сборка

```bash
npm run build -w @app/contracts
npm run build -w @app/backend
npm run build -w frontend
npm run test -w @app/backend
npm run lint -w frontend
```

## Ограничения

- Данные не сохраняются при перезапуске backend.
- Конфигурация Docker Compose запускает только Kafka; frontend и backend запускаются локально командами npm.
- Приложение рассчитано на один backend-процесс с общим in-memory состоянием. Для горизонтального масштабирования понадобится общее хранилище состояния и статусов команд.
