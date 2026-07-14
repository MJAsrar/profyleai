# Handoff: ProfyleAI — full product design (24 screens)

## Overview
ProfyleAI is an AI career platform for early-career job seekers. It spans a public marketing site, a credits-based dashboard app, four AI tools (résumé tailoring, cover letters, interview prep, live voice interview), payments, and legal/support pages. This package documents the complete visual system and every main screen so it can be rebuilt in a production codebase.

The central design thesis: **one job description flows through the whole journey.** The user enters a target job once and it carries into every AI tool — directly fixing the prior product's "eight disconnected tools" problem. Every screen reflects this via a shared *job-context strip* + *journey stepper*, and the dashboard leads with a "continue your journey" module.

## About the design files
The files in this bundle are **design references created in HTML** — a streaming-component prototype (`.dc.html`) that shows intended look, layout, copy, and behavior. **They are not production code to copy directly**, and the `.dc.html` uses a custom runtime (`support.js`) to render (open it via a local web server; both files are included).

The task is to **recreate these designs in the target codebase's existing environment** (React/Vue/Next/etc.) using its established components, tokens, and patterns. If no environment exists yet, choose an appropriate stack (React + a utility-CSS or CSS-modules setup works well here) and implement there. Do **not** ship the `.dc.html` or its runtime.

All 24 screens live in **one file**, laid out on a pan/zoom canvas grouped into six "turns" (build batches). Each screen has a visible id badge (`1a`, `2b`, `4e`, …) used throughout this README.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interaction states are all specified below and should be recreated precisely. Exact hex values and px sizes are given. Only these are placeholders, to be confirmed by the client:
- Pricing amounts ($9 / $19 / $39 / $79 / $149) and credit counts per pack
- All legal copy (draft; requires the client's counsel)
- Striped image slots (template thumbnails, candidate portrait, product screenshots)

---

## Design tokens

### Color
Warm, near-neutral paper palette with a single evergreen accent. Avoid pure black/white.

**Neutrals / surfaces**
- `--paper` `#f6f3ec` — primary page background (app + marketing)
- `--paper-cool` `#f4f4f1` — alternate neutral background
- `--card` `#fffdf8` — cards, sidebars, top bars (warm white)
- `--card-plain` `#ffffff` — résumé documents, inputs
- `--section-tint` `#eef2ea` — tinted section bands / preview panes
- `--canvas` `#1b1917` — the dark presentation canvas behind artboards (NOT part of the product; artifact of the design doc)

**Ink / text**
- `--ink` `#211f1c` — primary text (warm charcoal)
- `--ink-2` `#3a352e` — body text on tinted areas
- `--muted` `#5c564d` — secondary text
- `--muted-2` `#6f685f` — tertiary text
- `--faint` `#8a837a` — captions, mono labels
- `--faint-2` `#a79f93` — group labels, disabled
- `--hairline` `rgba(33,31,28,.08)` — borders/dividers (also `.10`, `.12`, `.16` at higher contrast)

**Accent — evergreen (primary brand)**
- `--accent` `#2e6a4a`
- `--accent-hover` `#26583d`
- `--accent-deep` `#22322a` — dark evergreen (CTA bands, journey module, voice-room, sidebar credit card, brand panel)
- `--accent-tint` `#e7efe8` — chips, active nav, monogram chips
- `--accent-on-dark` `#8fc7a3` — light evergreen text/labels on dark
- `--accent-focus-ring` `rgba(46,106,74,.12)` — input focus ring

**Semantic**
- Success = accent evergreen. Green check chip bg `#e7efe8`.
- Error `#b4472f`; error chip bg `#f7e6e0`.
- Warning/clay `#a1633c`; warning chip bg `#fff3e6` / `#f3ebe4`.
- Info uses clay or accent.

**Secondary hues** (used ONLY as muted monogram-chip tints to differentiate tools/cards — not brand accents):
- Indigo `#363ca0` on tint `#e9ebf3` / `#ebecf7`
- Clay `#a1633c` on tint `#f3ebe4`
- Olive `#4a6b34` on tint `#eef0e9`

**Rejected landing directions** (1b Toolkit indigo, 1c Studio terracotta) were removed — evergreen is the locked house style.

### Typography
Three families (Google Fonts):
- **Newsreader** (serif) — display/headings, the brand voice. Weights 400/500/600; italics 400/500 used for emphasis words. Used at 24–72px.
- **Hanken Grotesk** (sans) — all UI text and body. Weights 400/500/600/700/800.
- **JetBrains Mono** (mono) — labels, kickers, credit counts, metadata, eyebrows. Weights 400/500/700. Typically 10–13px, uppercase, letter-spacing `.06em`–`.16em`.

Key type patterns:
- Marketing H1/H2: Newsreader 500, 48–60px, line-height ~1.04, letter-spacing `-.015em`. One word often italic in `--accent`.
- Bold-alt headline (used once on a rejected variant) not needed now.
- Section eyebrow: JetBrains Mono 13px, `.16em`, `--accent`, uppercase.
- Body: Hanken 15–20px, line-height 1.55–1.7, `--muted`.
- Card title: Hanken 700, 15–17px, `--ink`.
- Big numbers/stats: Newsreader 30–40px, `--ink`.
- Mono metadata: JetBrains Mono 11–13px, `--faint`.

### Spacing
Base-4 scale: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 40, 48, 56, 64, 72, 84, 96, 110. Section padding on marketing pages: `72–88px` vertical, `56px` horizontal. App content padding: `28–40px`.

### Radius
- Inputs / small controls: `9–11px`
- Cards: `14–16px`
- Large cards / modals / hero panels: `18–22px`
- Pills / chips / avatars: `999px`
- Artboard frames (design-doc only): `16px`

### Shadows
- Card rest: `0 20px 46px -34px rgba(30,25,20,.28)` (and `-32/-30` variants)
- Card hover (app tool cards): `0 16px 40px -30px rgba(30,25,20,.4)`
- Elevated doc/preview: `0 24px 60px -30px rgba(30,25,20,.4)`
- Modal: `0 40px 100px -30px rgba(0,0,0,.6)`
- Toast: `0 12px 30px -22px rgba(30,25,20,.4)`
- Focus ring: `0 0 0 3px var(--accent-focus-ring)`

### Iconography (important)
**No illustrative SVG icons.** The system uses:
- **Geometric monogram chips** — a rounded square (`38–42px`, radius `10–11px`) filled with a tint, containing a 2-letter JetBrains Mono monogram in the tint's darker hue (e.g. `RB` résumé builder, `TL` tailor, `CL` cover letter, `IP` interview prep, `VI` voice, `MR` my résumés). Use your codebase's real icon set if preferred, but keep the monogram fallback consistent.
- Small shape bullets (dot/diamond/square `6–9px`) for nav and lists.
- A few inline glyph characters as lightweight icons: `✓ ✕ → ← ↓ ↻ ◇ ⌕ ⚙ + – ▾ ▲`. Replace with your icon library equivalents.
- Logo mark: rounded square `#2e6a4a`, radius 9px, containing a Newsreader `P` in `--paper`. Wordmark: "Profyle" in `--ink` + "AI" in `--accent`, Hanken 700.

---

## Global / cross-cutting components

**Public top nav** (`~64px`, bg `--card`, bottom hairline): logo left; center links (Templates / Pricing / Docs / Help — set varies by page; active link `--accent` weight 600); right = "Log in" (text) + "Get started" (accent button). On the landing (1a) a dismissible dark evergreen announcement bar sits above it (Chrome-extension promo, has a working ✕).

**Dashboard sidebar** (`256px`, bg `--card`, right hairline): logo top; nav grouped under mono labels **CREATE / IMPROVE / PRACTICE**; each item = shape bullet + label, active item has `--accent-tint` bg + `--accent-deep` text + accent bullet. Bottom: dark evergreen **credit card** (◇ count, thin progress bar at ~20%, "Buy credits" button) then a user row (avatar monogram + name + plan + gear).

**Focused tool top bar** (AI tools + builder, `~58–62px`): back-arrow to dashboard, logo mark, tool title; right = credit chip `◇ 10 credits` (+ Export/Preview/Style controls where relevant).

**Job-context strip** (the journey glue — on every AI tool, `~48px`, bg `--section-tint`): left = mono `JOB` + "Product Analyst · Northwind Labs" + requirement chips; right = **journey stepper** — a mono row `● Résumé — ● Tailored — [current pill] — Interview — Voice`, done steps in `--accent`, current step in an `--accent-tint` pill, upcoming in `--faint-2`.

**Buttons**
- Primary: bg `--accent`, text `--paper`, weight 600–700, padding `~14px 22px`, radius `11–12px`; hover `--accent-hover`. Credit-cost pills sit inside as `rgba(255,255,255,.16)` mono badges.
- Secondary/ghost: transparent, `1px` hairline border, `--ink` text; hover border+text `--accent`.
- On dark bands: bg `--paper`, text `--accent-deep`; hover `#fff`.

**Inputs** (bg `#fff`, `1px` hairline border, radius `10px`, padding `~12–13px 14px`, 14–15px text): label above in mono 11px `--faint`. Focus: border `--accent` + focus ring. Applies to text/email/password/select/textarea.

**Cards**: bg `--card`, `1px` hairline, radius `14–16px`, rest shadow; app tool cards lift border→accent + hover shadow on hover.

**Chips/pills**: radius 999px; category/skill chips `--accent-tint` bg + `--accent` text (or hairline outline when inactive).

**Footer** (marketing, `~32px`, bg `--paper`, top hairline): logo mark + `© 2026 ProfyleAI` left; text links right.

---

## Screens / Views

Grouped by turn. All marketing/app artboards are **1440px** wide unless noted; heights are content or fixed as stated. Recreate as responsive — these are desktop-first reference widths.

### 1a — Landing ("The Connected Journey") · public
Purpose: convert early-career visitors. Layout top→bottom: announcement bar → nav → hero (max 800px: mono eyebrow "FOR YOUR FIRST REAL JOB", Newsreader 60px headline with italic "ready" in accent, 20px subhead, primary "Start free — 10 credits" + ghost "See how it works", mono reassurance line) → **"Your path" panel** (white rounded card: 6 connected step nodes on a gradient rail `#cdd8ce→#2e6a4a` — Paste job / Build résumé / Tailor / Cover letter / Interview prep / Voice interview, each a 42px numbered circle, first+last filled accent, others outlined, with credit tags free/2/2/5/50) → **"One job description. Every step uses it."** two-col band (checklist + a "Job Profile · captured once" card) → dark CTA band → footer.

### 1d — Sign up / Log in · public · INTERACTIVE
Split 1240×840. Left 48%: dark evergreen brand panel (logo, Newsreader value headline, 3 checkmark benefits, footnote). Right 52%: auth card (max 420px) — tabs "Create account" / "Log in" (active tab underlined in accent), Google button (conic-gradient Google dot), "OR" divider, fields. See Interactions for behavior.

### 1e — Dashboard home · app
Sidebar + main. Top bar: mono date + "Good afternoon, Alex" (Newsreader 26px), search field, credit chip, "+ New résumé". Main (scroll): **"Continue where you left off"** dark evergreen module (job title, next-step copy, 5-dot mini stepper with Résumé✓/Tailored✓/Cover-letter next/Interview/Voice, big cream "Write cover letter → costs 2 credits" CTA) → 3 stat cards (Credits 10 / Résumés 2 / Applications in progress 1, Newsreader numerals) → "Jump back in" 3×2 tool card grid (differentiated monograms/tints) → "Recent activity" list (dot + text + mono timestamp).

### 2a — Templates gallery · public
Nav → centered header → filter chips row (All active + Modern/ATS/Tech/Minimalist/Traditional) → 3-col grid: 5 template cards (striped preview 3/4, name + mono category, "Use →"; ATS card has an "ATS ✓" badge) + a dashed "Start from blank" card → footer.

### 2b — Pricing & credits · public
Header "Pay for what you use. Credits never expire." → **"What a credit buys"** legend strip (Résumé free / Tailor 2 / Cover 2 / Interview 5 / Voice 50) → 5-col package cards (Taster 20/$9, **Job Hunt 50/$19 dark "MOST POPULAR"**, Momentum 120/$39, All-In 300/$79, Career+ 700/$149; each shows per-credit value + CTA) → fine print → footer.

### 2c — FAQ · public · INTERACTIVE (accordion), 1000px wide
Header → three labeled groups (General / Credits & billing / Privacy & data) of `<details>` accordion rows (question + animated +/− chip; first open by default) → "Contact us →" link → footer.

### 2d — Contact · public, 1240px
Two-col: left = "Talk to a human." + 3 inquiry-type rows (monogram + label + desc) + direct email + support hours; right = form card (Name+Email row, "What's this about?" select, Message textarea, "Send message").

### 3a — Résumé builder · app, 1460px, THE core surface
Top bar (back, title, "Saved 2m ago", template pill "Modern ▾", "Aa Style", credit chip, Preview, **Export PDF**). Three panes:
1. **Sections rail** (236px): Personal✓ / Summary✓ / Experience(active,3) / Education / Skills / Projects / Certifications, each with check or number chip; "Add section" dashed button; bottom completion bar (62%).
2. **Editor** (flex): "Experience" heading + "Add role"; expanded entry card (drag glyph, title, 2×2 field grid Title/Company/Dates/Location, "Highlights" bullet rows each with a "✦ AI" rewrite button, "+ Add bullet"); a collapsed second entry.
3. **Live preview** (472px, `--section-tint`): a scaled white résumé "page" (420px) rendering the Modern template with accent rule under the name; bottom **style controls bar** — Font (Sans ▾), Size stepper (10.5), Spacing range slider (accent-color), 4 accent color swatches (evergreen selected).

### 3b — My résumés · app
Sidebar (My résumés active) + main. Header ("3 saved") + Sort + "+ New résumé". 3-col card grid: each card = mini page thumbnail (built from tiny colored bars) + title + BASE/TAILORED tag + mono "template · edited" + action row (Open / Preview / Download / Delete right-aligned red-on-hover) + a dashed "Create a new résumé" card.

### 3c — Full-page preview · app, 1200px
Toolbar (back, title, "· Modern", zoom stepper 100%, Edit, **↓ Download PDF**). Centered on a neutral backdrop: a full **720px white résumé page** (56–60px padding) — the Modern template rendered large and readable: name 36px 800, accent role kicker, mono contact line, sections (Summary/Experience with `<ul>` bullets/Education/Skills chips) with accent uppercase headings.

### 4a — Tailor to a job · app · AI 2 credits
Focused top bar + job strip (current = Tailor). Two-col: left = Base-résumé select, Job-description textarea (pre-filled Northwind posting, labeled "pulled from your saved job"), "Re-tailor résumé · 2 credits". Right = result card: **82% match ring** (conic-gradient), "Strong match" + copy, "What changed" list (added keywords +, reworded ~, reordered ↑, still-missing ! in clay), "Save as new résumé" + "Preview".

### 4b — Cover letter · app · AI 2 credits
Job strip (current = Cover). Left panel (380px): Role/Company (prefilled), **Tone segmented control** (Professional active / Warm / Concise), highlight chips, "Regenerate · 2 credits". Right (`--section-tint`): live letter preview on a 640px white page (date, greeting, 4 paragraphs, sign-off) + Copy / ↓ Download PDF.

### 4c — Interview prep · app · AI 5 credits
Job strip (current = Interview). Three columns: left (290px) = tabs (Questions/Company/Coaching) + grouped question list (Behavioral/Role-specific), active question shows "● SCORED · 7.5"; center = current question (Newsreader 26px) + answer textarea (filled) + "Score against STAR"; right (350px) = **STAR feedback** — overall 7.5/10, four rows S/T/A/R (green chips for strong, clay for "add a metric"), suggested-close callout.

### 4d — Voice interview · setup wizard · app · AI 50 credits, 1240px
4-step stepper (Job details✓ / Résumé✓ / **Questions** active / Interview room). Two-col: left = Session summary card (role/résumé/interviewer) + dark "Meet Sarah" card; right = "Generated questions" card (5 numbered removable rows, Regenerate) + footer with camera/mic note + **"Enter interview room · 50 credits"**.

### 4e — Voice interview · live room · app, 1240×840, DARK
Dark evergreen surface `#16211b`. Header: logo + "Mock interview · Product Analyst", LIVE dot + timer 04:12. Main: Sarah tile (radial-gradient bg, 130px avatar with concentric glow rings, "SPEAKING" + a 7-bar waveform) + self-camera striped tile; **live caption bar** (Sarah's current question); control row (mic/cam/CC circles + red "End interview"). Right (322px): scrolling transcript (SARAH/YOU turns) + "after the session" note. All text light on dark.

### 5a — Settings · app
Sidebar (user row active) + main. "Settings" (Newsreader) + tab bar (Profile active / Account / Security / Preferences / Data). Profile tab: Photo card (72px avatar monogram + Upload/Remove), details card (Full name/Email row + Headline), Google connected-account card (Disconnect), Save changes / Cancel.

### 5b — Buy credits · modal, 1000×760
Dimmed app backdrop (striped + `rgba(18,26,20,.55)` scrim) with centered 560px modal: "Buy credits" + balance + ✕; 5 radio-row packages (Job Hunt selected, accent border + filled radio + POPULAR tag); "Continue to checkout · $19"; secure-checkout mono note.

### 5c — Not enough credits · modal, 720×600
Scrim + 420px centered modal: clay ◇ icon, "You need 2 more credits", "Interview prep costs 5 … you have 3" copy, balance row "3 / 5 needed", "Buy credits" + "Maybe later".

### 5d — Checkout success & cancel · two 600px cards
**Success:** accent ✓ circle, "50 credits added", honest copy ("we waited until your credits actually landed"), **before→after balance** chip (10 → 60), "Back to dashboard", receipt note. **Cancel:** neutral ↩ circle, "Checkout cancelled", "No charge was made", Try again / Back to dashboard.

### 5f — System states · spec sheet, 960px
Specimens: **Toasts** (success/error-with-Retry/info-with-Buy-more/loading-with-spinner — white pill, colored 3px left border, icon chip, title+desc, dismiss); **Empty state** (monogram, "No résumés yet", CTA); **Loading skeleton** (gradient bars); **Error state** (clay icon, message, Refresh + Contact).

### 6a — Docs · public
Nav (DOCS tag). Three columns: left doc TOC (searchable, grouped Getting started/Building/AI tools, "Quick start" active) + center article ("Quick start": breadcrumb, Newsreader H1, numbered H2 sections, an accent TIP callout, a screenshot slot, prev/next footer) + right "On this page" anchor list (in-page links to `#qs-1..4`).

### 6b — Help centre · public
Nav → tinted hero ("How can we help?" + search) → 6 category cards (monogram + title + desc, linking into docs/pricing/settings) → "Popular articles" 2-col link list → dark "Still stuck?" contact CTA band → footer.

### 6c — Legal (Privacy shown) · public, 1200px
Nav → two-col: left = doc switcher (Privacy active / Terms / Cookies / Security), "Last updated", in-page TOC (`#pv-1..6`); right = readable content column (max 640px): eyebrow, Newsreader H1, intro, a placeholder-notice callout, 6 numbered sections. Terms/Cookies/Security reuse this exact template with swapped content.

---

## Interactions & behavior
Currently wired in the prototype (recreate as real state):
- **Auth (1d):** tab toggle switches Create-account ↔ Log-in (moves the accent underline; shows/hides Full name, Confirm password, terms, strength meter; Forgot-password link only in Log in). Password **show/hide** toggles input type + "Show"/"Hide" label. **Live strength meter** (signup): scores length≥8, upper+lower, digit, symbol → Weak/Fair/Good/Strong with bar width 0–100% and color ramp (`#b4472f`→`#b07a2f`→`#4a7a3f`→`#2e6a4a`), 0.25s width transition. **Terms checkbox** gates the submit button (opacity .45 + not-allowed until checked). Submit label changes with mode.
- **Announcement bar (1a):** ✕ dismisses (hides bar).
- **FAQ (2c):** native `<details>` accordion; +/− chip swaps via `details[open]`.
- Everywhere else is high-fidelity static; **navigation** is via in-page anchors (badge ids). In production, wire these to real routes (see route map below).

Intended (to implement in the real app):
- **Journey continuity:** persist the active target job + résumé; the job-context strip and stepper read from it on every AI tool. "Continue" on the dashboard routes to the next incomplete step.
- **Credit gating:** any AI action checks balance first; if short, open the 5c modal; on success deduct and toast (5f). Never assert success — poll until credits land (5d).
- Builder: add/remove/reorder sections + entries + bullets; live preview updates on input; style controls change preview font/size/spacing/accent; Export PDF.
- Transitions: hovers ~150ms; keep motion subtle (no decorative animation).

## State management
- **auth**: mode (signup/login), showPassword, password (for strength), agreedToTerms → derived: canSubmit, strengthScore/label.
- **session/journey**: currentUser (name, email, avatar, plan), creditBalance (polled ~30s), targetJob {role, company, requirements[]}, activeResumeId, journeyProgress {resume, tailored, coverLetter, interviewPrep, voice}.
- **builder**: resume doc model (sections[], entries[], bullets[]), activeSection, styleSettings {font, size, spacing, accent}, saveState.
- **tools**: tailor {jobDescription, matchScore, changes[]}, coverLetter {tone, body}, interviewPrep {questions[], activeQ, answer, starScores}, voice {questions[], transcript[], timer, mic/cam state}.
- **modals/toasts**: buyCreditsOpen, insufficientOpen (with required vs have), toast queue.
- Data fetching: user/credits, saved résumés, AI generations (tailor/cover/questions/scoring), Stripe checkout + post-checkout credit poll, ElevenLabs voice session.

## Design tokens quick-reference (hex)
Paper `#f6f3ec` · card `#fffdf8` · plain `#ffffff` · tint `#eef2ea` · ink `#211f1c` · muted `#5c564d` · faint `#8a837a` · hairline `rgba(33,31,28,.08–.16)` · accent `#2e6a4a` · accent-hover `#26583d` · accent-deep `#22322a` · accent-tint `#e7efe8` · accent-on-dark `#8fc7a3` · voice-room `#16211b` · error `#b4472f` · clay `#a1633c` · indigo(tint-only) `#363ca0` · olive(tint-only) `#4a6b34`.

## Assets
No production images — all imagery is placeholder:
- Striped `repeating-linear-gradient` slots labeled in mono: template thumbnails (2a, 3b, 6a screenshot), candidate portrait (was on a removed variant), tailoring/product screenshots (6a).
- Résumé thumbnails in 3b are built from small colored `<div>` bars (no images).
- Fonts: Newsreader, Hanken Grotesk, JetBrains Mono (Google Fonts) — swap to licensed/self-hosted in production.
- Replace glyph/monogram icons with the codebase's icon library.

Provide real assets for: any marketing imagery, template previews, and product screenshots.

## Route map (suggested)
`/` (1a) · `/login` `/signup` (1d) · `/templates` (2a) · `/pricing` (2b) · `/faq` (2c) · `/contact` (2d) · `/dashboard` (1e) · `/dashboard/resume-builder` (3a) · `/dashboard/view-resumes` (3b) · `/dashboard/preview` (3c) · `/dashboard/resume-tailoring` (4a) · `/dashboard/cover-letter` (4b) · `/dashboard/interview` (4c) · `/dashboard/video-interview/enhanced` (4d) · `/dashboard/video-interview` (4e) · `/dashboard/settings` (5a) · buy-credits & insufficient = modals (5b/5c) · `/credits/success` `/credits/cancel` (5d) · toasts/empty/loading/error = shared components (5f) · `/docs` (6a) · `/help` (6b) · `/privacy` `/terms` `/cookies` `/security` (6c template).

## Files
- `Main Pages.dc.html` — the full design (all 24 screens). Open via a local static server; it loads `support.js` to render. This is a **reference**, not shippable code.
- `support.js` — the prototype runtime (needed only to view the reference; do not ship).
