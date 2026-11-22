#!/usr/bin/env python3
"""Generate all static bilingual pages for d1d2dopamine.is-a.dev from one source."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://d1d2dopamine.is-a.dev"
ASSET_V = "v2"

GITHUB_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.12c.98 0 1.95.13 2.86.38 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.4-2.7 5.38-5.28 5.67.42.36.78 1.06.78 2.14v3.27c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg>'
X_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18.9 2H22l-6.77 7.73L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.09 17.84h1.73L8.43 4.05H6.58l11.23 15.79Z"/></svg>'
MAIL_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 8.2L20.3 6H3.7L12 12.2Zm0 2.5L3 8v10h18V8l-9 6.7Z"/></svg>'

ROUTES = {
    "en": {"home": "index.html", "projects": "projects.html", "about": "about.html"},
    "ru": {"home": "ru.html", "projects": "projects-ru.html", "about": "about-ru.html"},
}

CONTENT = {
    "en": {
        "lang": "en",
        "locale": "en_US",
        "alt_locale": "ru_RU",
        "other_lang": "ru",
        "other_label": "RU",
        "skip": "Skip to content",
        "nav_label": "Primary navigation",
        "nav": {"home": "Home", "projects": "Projects", "about": "About"},
        "email_label": "Email",
        "footer_note": "Static site. No analytics or tracking.",
        "meta": {
            "home": ("d1d2dopamine", "Apps, research tools, and reproducible analyses by d1d2dopamine."),
            "projects": ("Projects — d1d2dopamine", "Open-source apps, statistical tools, and attention research by d1d2dopamine."),
            "about": ("About — d1d2dopamine", "What I’m interested in, how I work on projects, and how I use AI."),
        },
        "hero": {
            "lead": "I make local-first apps and research tools, and publish the code and analyses so other people can reproduce them.",
            "note": "Interested in neuroscience, statistics, and practical software. Most projects start when an existing tool is awkward to use or misses something essential.",
            "cta_primary": "Download ikna",
            "cta_secondary": "All projects",
            "cta_about": "About me",
        },
        "sections": {
            "flagship_title": "Flagship project",
            "flagship_link": "All projects",
            "other_title": "Other projects",
            "about_teaser": "I’m an indie developer working across apps, neuroscience, and statistics — using AI to write code while I focus on product direction, architecture, and scientific validity.",
            "about_cta": "Read more about me",
        },
        "projects_page": {
            "title": "Projects",
            "intro": "Open-source apps, statistical simulation tools, and reproducible research.",
            "filters": [("all", "All"), ("app", "Apps"), ("research", "Research"), ("tool", "Tools")],
        },
        "flagship": {
            "name": "ikna",
            "category": "app",
            "category_label": "App",
            "url": "https://github.com/d1d2dopamine/ikna",
            "release_url": "https://github.com/d1d2dopamine/ikna/releases/latest",
            "desc": "An open-source flashcard app for learning languages and other subjects in context. FSRS-6 schedules reviews, riar-manage regulates daily workload, and all history stays locally on your device.",
            "context": "Built so attention goes into learning, with almost no time spent managing queues, streaks, or accounts.",
            "tags": ["Android 10+", "Windows", "Linux", "FSRS-6", "Local-first", "GPL-3.0"],
            "cta_release": "Latest release",
            "cta_repo": "GitHub",
        },
        "projects": [
            {
                "name": "MVS Analyzer",
                "category": "research",
                "category_label": "Research",
                "stack": "Python · CLI / API",
                "url": "https://github.com/d1d2dopamine/MVS-analyzer",
                "desc": "Statistical analysis tool for repeated measurements. Compares summary variability metrics via simulation on your dataset, estimates statistical power and false-alarm rates, and saves run settings for reproducibility.",
                "context": "I first test how a variability metric behaves in the target scenario before trusting it in an analysis.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/MVS-analyzer")],
            },
            {
                "name": "Allostatic Sprint Hypothesis",
                "category": "research",
                "category_label": "Research",
                "stack": "Open Datasets · Zenodo",
                "url": "https://github.com/d1d2dopamine/allostatic-sprint-hypothesis",
                "desc": "Empirical testing of the Allostatic Sprint hypothesis across open attention-task datasets. Preserves positive results, null results, and cases where method limitations prevent a conclusion.",
                "context": "Null results stay in the repository so the analysis is never shaped to fit the hypothesis.",
                "links": [
                    ("GitHub", "https://github.com/d1d2dopamine/allostatic-sprint-hypothesis"),
                    ("Zenodo", "https://zenodo.org/records/21304761"),
                ],
            },
            {
                "name": "vespian",
                "category": "app",
                "category_label": "App",
                "stack": "Android · Health Connect",
                "url": "https://github.com/d1d2dopamine/vespian",
                "desc": "An on-device sleep model for Android. Reads Health Connect data locally to estimate when sleep is likely, displaying both a time window and forecast confidence.",
                "context": "Estimates when sleep is realistic today rather than enforcing one rigid bedtime.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/vespian")],
            },
            {
                "name": "trial3lib",
                "category": "tool",
                "category_label": "Tool",
                "stack": "Kotlin · Compose",
                "url": "https://github.com/d1d2dopamine/trial3lib",
                "desc": "A Compose UI design system for Android without Material defaults: no elevation, ripple, or arbitrary surface styling. Geometry, colors, and contrast live in test-verified shared tokens.",
                "context": "Enforces visual rules at the system level instead of overriding Material on every screen.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/trial3lib")],
            },
            {
                "name": "Gitctap",
                "category": "tool",
                "category_label": "Tool",
                "stack": "Python · Zero deps",
                "url": "https://github.com/d1d2dopamine/Gitctap",
                "desc": "Zero-dependency Python CLI for pushing one local Git repository to multiple forges while checking each remote through ordinary Git.",
                "context": "Removes manual multi-remote pushes and repeated shell aliases across repositories.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/Gitctap")],
            },
        ],
        "about_page": {
            "title": "About",
            "intro": "Indie developer focused on practical local-first apps, attention variability research, and transparent statistical tools.",
            "groups": [
                (
                    "Background and focus",
                    [
                        "I’m an indie developer of apps and software. What brought me to GitHub was the idea of doing my own research on attention variability in ADHD. I began working on that project seriously, and others followed: ikna, vespian, and a few more.",
                        "I’m interested in neuroscience, psychology, AI/ML, and statistics.",
                    ],
                ),
                (
                    "How I work with AI",
                    [
                        "The code in my projects is written by AI. I’m not a programmer: I work on the idea, the architecture, and problems AI might miss on its own. When it produces an unsuitable result, I try to explain what’s wrong. If the proposed solutions don’t fit at all, I use my intuition and figure out which direction to take.",
                        "I’m not a theorist, and I can’t always answer a difficult question on my own, for example in statistics. AI fills gaps in my knowledge, while scientific research gives me a reference point to rely on in my projects.",
                    ],
                ),
                (
                    "Product philosophy and evidence",
                    [
                        "My apps often grow out of frustrations with existing tools. If something makes a program awkward to use or it lacks a feature I need, I try to make my own version. I focus on a particular group of people with similar needs and don’t present my projects as “competitor killers”.",
                        "The scientific side matters to me. I try to understand what a decision is based on, even if it has long been standard practice. Before using a study in a project, I look at its validity and reproducibility, then examine the effect it found. I choose results I can apply to my task, taking the study’s limitations into account.",
                    ],
                ),
            ],
            "aside_focus_title": "Focus areas",
            "aside_focus": [
                "Neuroscience & ADHD attention variability",
                "Local-first Android & Desktop apps",
                "Reproducible statistical analyses",
                "Human-directed AI engineering",
            ],
            "aside_links_title": "Links & contact",
        },
    },
    "ru": {
        "lang": "ru",
        "locale": "ru_RU",
        "alt_locale": "en_US",
        "other_lang": "en",
        "other_label": "EN",
        "skip": "К содержанию",
        "nav_label": "Основная навигация",
        "nav": {"home": "Главная", "projects": "Проекты", "about": "Обо мне"},
        "email_label": "Почта",
        "footer_note": "Статический сайт. Без аналитики и трекеров.",
        "meta": {
            "home": ("d1d2dopamine", "Приложения, инструменты для исследований и воспроизводимые анализы."),
            "projects": ("Проекты — d1d2dopamine", "Приложения с открытым кодом, статистические инструменты и исследования."),
            "about": ("Обо мне — d1d2dopamine", "Что мне интересно, как я работаю над проектами и использую ИИ."),
        },
        "hero": {
            "lead": "Делаю локальные приложения и инструменты для исследований. Код и анализы выкладываю открыто, чтобы их можно было воспроизвести.",
            "note": "Интересуюсь нейробиологией, статистикой и прикладным софтом. Большинство проектов начинается, когда готовый инструмент неудобен или в нём не хватает важной функции.",
            "cta_primary": "Скачать ikna",
            "cta_secondary": "Все проекты",
            "cta_about": "Обо мне",
        },
        "sections": {
            "flagship_title": "Главный проект",
            "flagship_link": "Все проекты",
            "other_title": "Другие проекты",
            "about_teaser": "Я инди-разработчик на стыке приложений, нейробиологии и статистики — код пишут ИИ-модели, а я отвечаю за идею, архитектуру, UX и опору на проверяемые исследования.",
            "about_cta": "Подробнее обо мне",
        },
        "projects_page": {
            "title": "Проекты",
            "intro": "Приложения с открытым исходным кодом, инструменты моделирования и воспроизводимые исследования.",
            "filters": [("all", "Все"), ("app", "Приложения"), ("research", "Исследования"), ("tool", "Инструменты")],
        },
        "flagship": {
            "name": "ikna",
            "category": "app",
            "category_label": "Приложение",
            "url": "https://github.com/d1d2dopamine/ikna",
            "release_url": "https://github.com/d1d2dopamine/ikna/releases/latest",
            "desc": "Открытое приложение карточек для изучения языков и других тем в контексте. Повторения планирует FSRS-6, дневную нагрузку регулирует riar-manage, а вся история хранится локально на устройстве.",
            "context": "Сделано так, чтобы внимание уходило на обучение, а не на возню с очередями, аккаунтами и искусственными сериями.",
            "tags": ["Android 10+", "Windows", "Linux", "FSRS-6", "Оффлайн", "GPL-3.0"],
            "cta_release": "Последний релиз",
            "cta_repo": "GitHub",
        },
        "projects": [
            {
                "name": "MVS Analyzer",
                "category": "research",
                "category_label": "Исследование",
                "stack": "Python · CLI / API",
                "url": "https://github.com/d1d2dopamine/MVS-analyzer",
                "desc": "Инструмент для статистического анализа повторных измерений. Сравнивает сводные метрики вариабельности через моделирование на конкретном датасете, оценивает статистическую мощность и частоту ложных срабатываний.",
                "context": "Сначала проверяю, как метрика ведёт себя в нужном сценарии, прежде чем опираться на неё в анализе.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/MVS-analyzer")],
            },
            {
                "name": "Allostatic Sprint Hypothesis",
                "category": "research",
                "category_label": "Исследование",
                "stack": "Открытые датасеты · Zenodo",
                "url": "https://github.com/d1d2dopamine/allostatic-sprint-hypothesis",
                "desc": "Проверка исходной гипотезы Allostatic Sprint на открытых наборах данных задач на внимание. Сохраняю все результаты: положительные, нулевые и те, где ограничения метода не позволяют сделать вывод.",
                "context": "Нулевые результаты остаются в репозитории, чтобы не подгонять анализ под гипотезу.",
                "links": [
                    ("GitHub", "https://github.com/d1d2dopamine/allostatic-sprint-hypothesis"),
                    ("Zenodo", "https://zenodo.org/records/21304761"),
                ],
            },
            {
                "name": "vespian",
                "category": "app",
                "category_label": "Приложение",
                "stack": "Android · Health Connect",
                "url": "https://github.com/d1d2dopamine/vespian",
                "desc": "Локальная модель сна для Android. Считывает данные Health Connect на устройстве, оценивает вероятное окно засыпания и показывает уверенность прогноза.",
                "context": "Оценивает, когда сон вероятен именно сегодня, вместо жёстко заданного времени отбоя.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/vespian")],
            },
            {
                "name": "trial3lib",
                "category": "tool",
                "category_label": "Инструмент",
                "stack": "Kotlin · Compose",
                "url": "https://github.com/d1d2dopamine/trial3lib",
                "desc": "Compose-дизайн-система для Android без умолчаний Material: без теней, ripple и лишних поверхностей. Геометрия, цвета и контраст задаются общими токенами и проверяются тестами.",
                "context": "Задаёт правила на уровне системы, чтобы не отключать элементы Material вручную на каждом экране.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/trial3lib")],
            },
            {
                "name": "Gitctap",
                "category": "tool",
                "category_label": "Инструмент",
                "stack": "Python · Без зависимостей",
                "url": "https://github.com/d1d2dopamine/Gitctap",
                "desc": "Python-утилита без внешних зависимостей для отправки одного локального Git-репозитория сразу на несколько хостингов с проверкой каждого remote через обычный Git.",
                "context": "Убирает ручные повторяющиеся push и одинаковые shell-алиасы в каждом проекте.",
                "links": [("GitHub", "https://github.com/d1d2dopamine/Gitctap")],
            },
        ],
        "about_page": {
            "title": "Обо мне",
            "intro": "Инди-разработчик на стыке локальных приложений, исследований вариабельности внимания и воспроизводимой статистики.",
            "groups": [
                (
                    "С чего всё началось",
                    [
                        "Я инди-разработчик приложений и программ. На GitHub меня привела идея провести собственное исследование вариабельности внимания при СДВГ. Начал серьёзно заниматься этим проектом, а потом появились и другие: ikna, vespian и ещё несколько.",
                        "Мне интересны нейробиология, психология, AI/ML и статистика.",
                    ],
                ),
                (
                    "Как я работаю с ИИ",
                    [
                        "Код в моих проектах написан ИИ. Я не программист: занимаюсь идеей, архитектурой и проблемами, которые ИИ сам может не заметить. Когда он выдаёт неподходящий результат, стараюсь объяснить, где проблема. Если предложенные решения вообще не подходят, подключаю свою интуицию и пробую разобраться, в какую сторону двигаться.",
                        "Я не теоретик и не всегда могу самостоятельно ответить на сложный вопрос, например по статистике. ИИ дополняет мои знания, а научные исследования дают ориентир, на который можно опираться в проектах.",
                    ],
                ),
                (
                    "Подход к продуктам и науке",
                    [
                        "Часто мои приложения появляются из-за неудобств в существующих инструментах. Если что-то мешает пользоваться программой или в ней не хватает нужной функции, пробую сделать свой вариант. Ориентируюсь на определённый круг людей с похожими задачами и не позиционирую свои проекты как «убийц конкурентов».",
                        "Мне важна научная часть. Стараюсь разбираться, на чём основано решение, даже если оно давно стало привычным. Прежде чем использовать исследование в проекте, смотрю на его валидность и воспроизводимость, затем разбираюсь с полученным эффектом. Выбираю результаты, которые могу применить к своей задаче, учитывая ограничения исследования.",
                    ],
                ),
            ],
            "aside_focus_title": "Основные направления",
            "aside_focus": [
                "Нейробиология и вариабельность внимания при СДВГ",
                "Локальные приложения для Android и ПК",
                "Воспроизводимый статистический анализ",
                "Разработка с ИИ под контролем человека",
            ],
            "aside_links_title": "Ссылки и связь",
        },
    },
}


def canonical_url(route: str) -> str:
    return f"{ORIGIN}/" if route == "index.html" else f"{ORIGIN}/{route}"


def render_head(lang: str, page: str) -> str:
    c = CONTENT[lang]
    title, desc = c["meta"][page]
    route = ROUTES[lang][page]
    en_url = canonical_url(ROUTES["en"][page])
    ru_url = canonical_url(ROUTES["ru"][page])
    canon = canonical_url(route)
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="author" content="d1d2dopamine">
  <meta name="theme-color" content="#0A111A">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(desc)}">
  <link rel="canonical" href="{canon}">
  <link rel="alternate" hreflang="en" href="{en_url}">
  <link rel="alternate" hreflang="ru" href="{ru_url}">
  <link rel="alternate" hreflang="x-default" href="{en_url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="d1d2dopamine">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(desc)}">
  <meta property="og:url" content="{canon}">
  <meta property="og:image" content="{ORIGIN}/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="{c['locale']}">
  <meta property="og:locale:alternate" content="{c['alt_locale']}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(title)}">
  <meta name="twitter:description" content="{escape(desc)}">
  <meta name="twitter:image" content="{ORIGIN}/assets/og-image.png">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon.png">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <link rel="preload" href="assets/fonts/geologica-regular.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/geologica-semibold.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="styles.css?v={ASSET_V}">
</head>"""


def render_header(lang: str, page: str) -> str:
    c = CONTENT[lang]
    other = c["other_lang"]
    nav_links = []
    for key in ("home", "projects", "about"):
        href = ROUTES[lang][key]
        current = ' aria-current="page"' if key == page else ""
        nav_links.append(f'<a href="{href}"{current}>{escape(c["nav"][key])}</a>')
    other_href = ROUTES[other][page]
    return f"""  <a class="skip-link" href="#content">{escape(c['skip'])}</a>
  <div class="sky-backdrop" aria-hidden="true"></div>
  <header class="site-header">
    <div class="container header-inner">
      <div class="header-left">
        <a class="brand" href="{ROUTES[lang]['home']}">
          <img class="brand-mark" src="assets/favicon.png" alt="" width="24" height="24">
          <span>d1d2dopamine</span>
        </a>
        <nav class="primary-nav" aria-label="{escape(c['nav_label'])}">
          {''.join(nav_links)}
        </nav>
      </div>
      <div class="header-right">
        <a class="icon-link" href="https://github.com/d1d2dopamine" rel="me noopener" aria-label="GitHub" title="GitHub">{GITHUB_SVG}</a>
        <a class="icon-link" href="https://x.com/d1d2dopamine" rel="me noopener" aria-label="X" title="X">{X_SVG}</a>
        <a class="icon-link" href="mailto:d1d2dopamine@gmail.com" aria-label="{escape(c['email_label'])}" title="{escape(c['email_label'])}">{MAIL_SVG}</a>
        <a class="lang-switch" href="{other_href}" hreflang="{other}" aria-label="Switch language to {c['other_label']}">{c['other_label']}</a>
      </div>
    </div>
  </header>"""


def render_footer(lang: str, page: str) -> str:
    c = CONTENT[lang]
    other = c["other_lang"]
    other_href = ROUTES[other][page]
    return f"""  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-links">
        <span>d1d2dopamine</span>
        <a href="https://github.com/d1d2dopamine" rel="me noopener">GitHub</a>
        <a href="https://x.com/d1d2dopamine" rel="me noopener">X</a>
        <a href="mailto:d1d2dopamine@gmail.com">{escape(c['email_label'])}</a>
        <a href="{other_href}" hreflang="{other}">{c['other_label']}</a>
      </div>
      <span class="footer-note">{escape(c['footer_note'])}</span>
    </div>
  </footer>
  <script src="site.js?v={ASSET_V}" defer></script>
</body>
</html>
"""


def render_flagship(lang: str, heading_tag: str = "h3") -> str:
    f = CONTENT[lang]["flagship"]
    tags = "".join(f'<span class="tag">{escape(t)}</span>' for t in f["tags"])
    return f"""      <article class="flagship" data-category="{f['category']}">
        <div>
          <div class="flagship-head">
            <img class="flagship-icon" src="assets/ikna-icon.png" alt="" width="40" height="40">
            <div>
              <{heading_tag} class="flagship-title"><a href="{f['url']}" rel="noopener">{escape(f['name'])}</a></{heading_tag}>
            </div>
          </div>
          <p class="flagship-desc">{escape(f['desc'])}</p>
          <p class="flagship-note">{escape(f['context'])}</p>
          <div class="meta-row">
            <span class="tag tag-accent">{escape(f['category_label'])}</span>
            {tags}
          </div>
          <div class="flagship-actions">
            <a class="btn btn-primary" href="{f['release_url']}" rel="noopener">{escape(f['cta_release'])}</a>
            <a class="btn" href="{f['url']}" rel="noopener">{escape(f['cta_repo'])}</a>
          </div>
        </div>
        <figure class="flagship-media">
          <img src="assets/ikna-banner.png" alt="ikna — know / don’t know. we handle the rest." width="1600" height="500" loading="eager">
        </figure>
      </article>"""


def render_project_cards(lang: str, heading_tag: str = "h3") -> str:
    cards = []
    for p in CONTENT[lang]["projects"]:
        links = "".join(
            f'<a href="{url}" rel="noopener">{escape(label)}</a>'
            for label, url in p["links"]
        )
        cards.append(f"""        <article class="project-card" data-category="{p['category']}">
          <div class="card-meta">
            <span class="tag">{escape(p['category_label'])}</span>
            <span class="card-stack">{escape(p['stack'])}</span>
          </div>
          <{heading_tag}><a href="{p['url']}" rel="noopener">{escape(p['name'])}</a></{heading_tag}>
          <p class="project-desc">{escape(p['desc'])}</p>
          <p class="project-context">{escape(p['context'])}</p>
          <div class="card-links">{links}</div>
        </article>""")
    return '<div class="project-grid">\n' + "\n".join(cards) + "\n      </div>"


def build_home(lang: str) -> str:
    c = CONTENT[lang]
    h = c["hero"]
    s = c["sections"]
    return f"""{render_head(lang, "home")}
<body>
{render_header(lang, "home")}
  <main id="content">
    <section class="hero">
      <div class="container">
        <div class="hero-inner">
          <h1>d1d2dopamine</h1>
          <p class="hero-lead">{escape(h['lead'])}</p>
          <p class="hero-note">{escape(h['note'])}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="{c['flagship']['release_url']}" rel="noopener">{escape(h['cta_primary'])}</a>
            <a class="btn" href="{ROUTES[lang]['projects']}">{escape(h['cta_secondary'])}</a>
            <a class="btn btn-ghost" href="{ROUTES[lang]['about']}">{escape(h['cta_about'])}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">{escape(s['flagship_title'])}</h2>
        </div>
{render_flagship(lang, heading_tag="h3")}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">{escape(s['other_title'])}</h2>
          <a class="section-link" href="{ROUTES[lang]['projects']}">{escape(s['flagship_link'])}</a>
        </div>
{render_project_cards(lang, heading_tag="h3")}
        <div class="home-about">
          <p>{escape(s['about_teaser'])}</p>
          <a class="btn" href="{ROUTES[lang]['about']}">{escape(s['about_cta'])}</a>
        </div>
      </div>
    </section>
  </main>
{render_footer(lang, "home")}"""


def build_projects(lang: str) -> str:
    c = CONTENT[lang]
    pp = c["projects_page"]
    filters = []
    for key, label in pp["filters"]:
        pressed = "true" if key == "all" else "false"
        filters.append(f'<button type="button" class="filter-btn" data-filter="{key}" aria-pressed="{pressed}">{escape(label)}</button>')
    return f"""{render_head(lang, "projects")}
<body>
{render_header(lang, "projects")}
  <main id="content">
    <section class="page-header">
      <div class="container">
        <h1>{escape(pp['title'])}</h1>
        <p class="page-intro">{escape(pp['intro'])}</p>
        <div class="filter-bar" data-filter-bar role="group" aria-label="{escape(pp['title'])}" hidden>
          {''.join(filters)}
        </div>
      </div>
    </section>

    <section>
      <div class="container">
{render_flagship(lang, heading_tag="h2")}
      </div>
    </section>

    <section class="section">
      <div class="container">
{render_project_cards(lang, heading_tag="h2")}
      </div>
    </section>
  </main>
{render_footer(lang, "projects")}"""


def build_about(lang: str) -> str:
    c = CONTENT[lang]
    ap = c["about_page"]
    groups = []
    for heading, paragraphs in ap["groups"]:
        ps = "\n          ".join(f"<p>{escape(p)}</p>" for p in paragraphs)
        groups.append(f"""        <section class="essay-group">
          <h2>{escape(heading)}</h2>
          {ps}
        </section>""")
    focus_items = "\n            ".join(f"<li>{escape(item)}</li>" for item in ap["aside_focus"])
    return f"""{render_head(lang, "about")}
<body>
{render_header(lang, "about")}
  <main id="content">
    <section class="page-header">
      <div class="container">
        <h1>{escape(ap['title'])}</h1>
        <p class="page-intro">{escape(ap['intro'])}</p>
      </div>
    </section>

    <section>
      <div class="container about-layout">
        <article class="essay">
{"".join(groups)}
        </article>
        <aside class="about-aside">
          <div class="aside-card">
            <h2 class="aside-title">{escape(ap['aside_focus_title'])}</h2>
            <ul class="aside-list">
            {focus_items}
            </ul>
          </div>
          <div class="aside-card">
            <h2 class="aside-title">{escape(ap['aside_links_title'])}</h2>
            <div class="aside-links">
              <a href="https://github.com/d1d2dopamine" rel="me noopener">GitHub <span>@d1d2dopamine</span></a>
              <a href="https://x.com/d1d2dopamine" rel="me noopener">X <span>@d1d2dopamine</span></a>
              <a href="mailto:d1d2dopamine@gmail.com">{escape(c['email_label'])} <span>gmail</span></a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
{render_footer(lang, "about")}"""


def build_404() -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="author" content="d1d2dopamine">
  <meta name="theme-color" content="#0A111A">
  <meta name="robots" content="noindex">
  <title>Page not found — d1d2dopamine</title>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon.png">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/styles.css?v={ASSET_V}">
</head>
<body>
  <div class="sky-backdrop" aria-hidden="true"></div>
  <main id="content">
    <div class="container">
      <section class="error-card">
        <p class="error-code">404</p>
        <h1>Nothing here.</h1>
        <p>The page may have moved or the address may have a typo.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/">Home</a>
          <a class="btn" href="/projects.html">Projects</a>
          <a class="btn btn-ghost" href="/ru.html">По-русски</a>
        </div>
      </section>
    </div>
  </main>
</body>
</html>
"""


def main() -> None:
    outputs = {
        "index.html": build_home("en"),
        "ru.html": build_home("ru"),
        "projects.html": build_projects("en"),
        "projects-ru.html": build_projects("ru"),
        "about.html": build_about("en"),
        "about-ru.html": build_about("ru"),
        "404.html": build_404(),
    }
    for name, html in outputs.items():
        path = ROOT / name
        path.write_text(html, encoding="utf-8", newline="\n")
        print(f"wrote {name} ({len(html.encode('utf-8'))} bytes)")


if __name__ == "__main__":
    main()
