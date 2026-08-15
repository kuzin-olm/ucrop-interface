# CropOptimize — экран «Культуры»

React-приложение по дизайн-спецификации `docs/design.md`.


## Требования

- Node.js 20+
- npm 10+
- ключ [Яндекс.Карт](https://developer.tech.yandex.ru/) в `.env`:

```env
VITE_YANDEX_MAPS_API_KEY=ваш_ключ
```

Без ключа таблица полей работает, карта может не загрузиться.

## Запуск

```bash
npm install
npm run dev
```

Откройте в браузере: [http://localhost:5173](http://localhost:5173)

Сначала экран входа. Демо: `anna@agro.local` / `demo123`.

## Другие команды

```bash
npm run build    # production-сборка
npm run preview  # локальный просмотр сборки
```

## Что уже работает

- Каталог культур с фильтрами, поиском и карточками
- Состояния loading / empty / error
- Модалка «Добавить культуру»
- Drawer с деталями культуры
- Данные сохраняются в `localStorage` (ключ `cropoptimize.crops.v1`)
