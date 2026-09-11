# TRI-27 website snapshot

This directory is an extracted snapshot and design lab. The live t27.ai source
remains in [gHashTag/trinity/apps/website](https://github.com/gHashTag/trinity/tree/main/apps/website).
The publisher has not switched to tri-27; see [trinity#974](https://github.com/gHashTag/trinity/issues/974)
and the [repository ownership notes](../../README.md). The inherited notes below
describe the snapshot's historical content and workflow, not current production
status. Run `npm run check:queen-snapshot` only to compare this local Queen page
with its committed recording; it is not a production acceptance check.

## Что этот сайт утверждает и в каком порядке

Сайт представляет **пару** числовых форматов для тернарного датапути:

| Порядок | Формат        | Роль в нейроне | Чем подкреплён                                                        |
| ------- | ------------- | -------------- | --------------------------------------------------------------------- |
| первый  | **GFTernary** (в артефактах — `GF-T`) | вес            | декодер 66 LUT @ 974.66 МГц на XC7A200T `[измерено]`, страница `/gft` |
| второй  | **TNF** (Ternary Network Floats)      | аккумулятор    | лестница из 9 ступеней, в железе разведено 5 `[измерено]`             |

Порядок имён перевёрнут 14.08.2026 по распоряжению автора: впереди тот член
пары, у которого есть собственная измеренная аппаратная цифра и собственная
страница. Пара остаётся парой — меняется порядок, не состав. Если правите
надзаголовок, вордмарк или мета-теги, меняйте их **вместе**: они читаются как
одно утверждение.

Точки, где этот порядок закреплён и где он разъезжается первым:

- `index.html` — `<title>`, `og:title`, `twitter:title`, `description`, JSON-LD;
- `messages/{en,ru,de,es,zh}.json`, ключ `hero.tag` — именно оттуда плагин
  `prerenderHero` в `vite.config.ts` собирает блок `#boot` — единственное, что
  видит читатель без JavaScript и поисковый робот. Правка `#boot` в
  `index.html` на сборку НЕ влияет: плагин перепишет его целиком;
- `src/content/tnf.ts` — `hero.eyebrow`, `hero.sub`, `claim.title`;
- `src/components/sections/tnf/index.tsx` — константа `WORDMARK` в связке;
- `src/components/Navigation.tsx` — подписи `note` / `noteRu`;
- `src/hooks/usePageMeta.ts` — заголовки и описания подстраниц.

## Правила честности (BINDING)

Нарушение любого пункта — регресс, а не стилистика.

- Никаких «первый / единственный / лучший».
- Каталог — **83 формата** (не 84). Препринт arXiv:2606.09686 в v1 говорит 84;
  это расхождение известно и лечится erratum, а не подгонкой сайта.
- Сравнение точности — **только с takum**: 2.1× на 16 битах, точно 2.6× на 32.
  С **tekum** сравнения нет: оракул, помеченный tekum, декодировал все 65 536
  шестнадцатибитных кодов идентично takum-оракулу.
- Кремния нет. Всё железо разведено на бинарной FPGA ALINX AX7203
  (Xilinx Artix-7 XC7A200T). SKY130 / Tiny Tapeout — «отправлен на
  изготовление», измерений на кристалле нет.
- В железе 5 ступеней лестницы из 9. TNF128 не заявлен.
- Тернарность трижды независимо проиграла бинарности в наших же измерениях;
  вклад — условие, при котором применим 68-летний аргумент о радиксе, а не сам
  аргумент.
- Каждое число на главной несёт тег происхождения (`measured`, `proved`, `coq`,
  `spec`, `derived`, `competitor`, `retracted`, `terms`, `plan`, `external`).
  Цифра без тега на страницу не попадает. Единственный источник цифр главной —
  `src/content/tnf.ts`; компоненты только показывают факт и обязаны показать его
  тег.
- Состояние PR называть точно: `merged` / «отправлен в апстрим», не «принят».

Строки, которых на живом сайте быть не должно (отозванные заявления):
`2.84`, `5.53`, `tekum16`, `100x Faster`, `99.8%`, `578.8`, `Binary Era is Over`.

## Разработка

```bash
npm ci                  # или bun install
npx tsc --noEmit        # типы; обязательный гейт
npx vite build          # сборка; печатает стектрейсы даже при успехе —
                        # перенаправьте вывод в файл и грепните "built in"
npm run dev
```

## Визуальная проверка

Любая правка вёрстки проверяется глазами, а не «должно быть нормально»:

```bash
python3 -m http.server 4173 --directory dist &
node ../../../wave_audit/qa/page_shot.js <route>
```

URL строго вида `http://localhost:4173/index.html?lang=ru#/<route>` — запрос
**до** решётки, иначе страница отрендерится по-английски. Скрипт прокручивает
страницу перед fullPage-снимком: блоки на `framer-motion whileInView` иначе
остаются прозрачными и выглядят как пустые провалы, которые дефектом не
являются. Смотреть на снимке: переносы слов, обрезанный текст, контраст текста
к фону.

### Уроки вёрстки, которые не надо переоткрывать

- Вложенный `<section>` наследует глобальные `min-height: 60vh`, вертикальное
  центрирование и `text-align: center` — между блоками появляются экраны
  пустоты. Внутри страницы использовать `<div>`.
- `.premium-card` задаёт `flex-direction: column`; любой inline `display: flex`
  внутри требует явного `flexDirection: 'row'`.
- `<p>` без явного margin получает глобальный `margin: 0 auto` и вместе с
  max-width даёт ложный отступ слева. Задавать margin целиком:
  `margin: '0.9rem 0 0'`.
- `<p>` внутри `.tnf-section` центрируется CSS; для длинного текста задавать
  `maxWidth: 'none'` и выравнивание по левому краю.
- Сетка `repeat(auto-fit, minmax(220–260px, 1fr))` при контейнере 900px и
  четырёх карточках даёт 3+1 с сиротой; для четырёх ставить
  `minmax(300–320px, 1fr)`.
- Пол кегля — `0.82rem` (13px).
- Массивы навигации позиционные: порядок не менять без причины.
- Русская локаль ломается не в словаре, а в захардкоженных JSX-абзацах —
  искать по строкам английского текста прямо в `.tsx`.

## Production publishing ownership

As verified on 2026-09-12, `gHashTag/ghashtag.github.io` publishes the apex from
`gHashTag/trinity@main`, building that repository's `apps/website` directory.
See the [pinned publisher workflow](https://github.com/gHashTag/ghashtag.github.io/blob/d380f4e9f16eab9733595401682875423faba040/.github/workflows/publish-website.yml).
A merge in tri-27 does not publish to t27.ai. The publisher schedule is not a
delivery guarantee; the [delivery record](https://t27.ai/status/delivery.json)
identifies the served source revision and publication time.

A future cutover needs an explicit source reconciliation, acceptance-suite
migration, publisher change, and served-revision verification. No cutover is
performed by this documentation change.
