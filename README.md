# ESCAPE! — AI Travel Agent

Marketing and product site for **ESCAPE!**, a personal AI travel agent.
Static site, no build step: upload the repository root as-is.

## Structure

```
index.html               single-page product story (25 sections)
privacy.html             ┐
terms.html               │
cookies.html             ├ legal pages (shared renderer, content in assets/legal-docs.js)
disclaimer.html          │
community.html           ┘
404.html                 localised not-found page
assets/
  styles.css             design system + all page styles
  app.js                 i18n engine, scroll storytelling, modals, cookie consent
  i18n.js                RU / UA / EN dictionary for index.html
  legal.css              legal page styles
  legal.js               legal page renderer + chrome strings
  legal-docs.js          5 legal documents × 3 languages
  fonts.css              @font-face declarations
  fonts/                 self-hosted woff2 (Manrope, Onest, Great Vibes)
img/                     WebP imagery, responsive pairs (-sm 1200w / -lg 2200w, q80)
api/
  waitlist.js            early-access intake (validation, throttling, delivery)
tools/
  stamp.js               content-hash the asset URLs
  prerender.js           bake legal text into the pages for no-JS readers
favicon.svg  apple-touch-icon.png  site.webmanifest
robots.txt   sitemap.xml           vercel.json
```

## Languages

Russian, Ukrainian and English. Everything is translated: navigation, copy,
phone UI, forms, validation, cookie banner, legal documents, SEO metadata and
accessibility labels.

Selection order: `?lang=` query parameter → `localStorage` → browser language →
Russian fallback. The choice persists across pages.

## Brand

The wordmark is Great Vibes set in ESCAPE red, given a hairline stroke for body;
the exclamation mark is a custom location-pin SVG (`#brand-pin`), tilted 13° to
the right so it sits on the script's own slant, and aligned to its baseline.
It is defined once as an SVG symbol and referenced everywhere — never redrawn.

## Design system

Tokens live at the top of `assets/styles.css`: navy/warm-white/sky palette with
red used only as an accent, a clamp-based type scale, an 8px spacing rhythm and
one device component with three sizes (hero 100%, feature 85–95%, secondary
70–80%).

## The Christmas season (20 November – 14 January)

`assets/season.css` and `assets/season.js` are a layer over the site, loaded
after `styles.css` and `app.js`; the season leaves by removing their two tags
(and the `#xmas` / `#santa` sections, the garland lines and `.sky`).

- **One sky.** `.sky` sits behind every section and runs dawn → day → golden
  sunset → dusk → starry night. Each colour is pinned to a section by its
  `data-sky` attribute (`name`, `name@0.7` for a fraction of its height,
  `name@pad` for the end of its top padding); `season.js` turns those into
  one gradient in pixels and fades the stars in as the reader reaches the
  night. No section paints a ground of its own, so there is no seam to see.
- **Tone follows the sky.** Every section from `#santa` down is
  `.section--dark` (light words); above it, the darker scenes are rounded
  panes (`.section--panel`) instead of bands.
- **One phone.** `.device` is an iPhone of this generation drawn in CSS:
  titanium rim, black glass, a 9 : 19.5 screen, Dynamic Island and the side
  buttons. A whole 1320 × 2868 screenshot fills it exactly; the older cut
  store screens are drawn at full height.
- **Pictures.** `img/xmas/` comes from the app's own Christmas assets
  (`python3 tools/xmas-assets.py /path/to/Escape.travel.app`); new screens
  of the app go through `python3 tools/app-shots.py <dir>` (raw PNGs in
  `<dir>/<lang>/<name>.png` → `img/app/<lang>/<name>.webp`).

## Waitlist intake

`api/waitlist.js` is a serverless function Vercel deploys from this repository,
on the site's own origin. It validates and normalises the application, throttles
a flood from one IP, drops anything that fills the hidden field no human sees,
and sets the timestamp itself rather than trusting the page.

**It does nothing until you give it a destination.** Set one of these in the
Vercel project (Settings → Environment Variables), then redeploy:

| Variable | Effect |
| --- | --- |
| `WAITLIST_FORWARD_URL` | POST the application as JSON to your own API |
| `WAITLIST_FORWARD_TOKEN` | optional bearer token for that call |
| `RESEND_API_KEY` | deliver it as email through Resend instead |
| `WAITLIST_TO` | inbox that receives it (required with Resend) |
| `WAITLIST_FROM` | verified sender on your Resend domain (required with Resend) |

The forwarded JSON is `{name, email, platform, message, lang, at}` — `platform`
is one of `ios` / `android` / `any`, `at` is set server-side.

### Setting up email delivery

1. Sign up at [resend.com](https://resend.com) with the address that should
   receive the applications.
2. Copy an API key (it starts with `re_`).
3. In the Vercel project, Settings → Environment Variables:

   ```
   RESEND_API_KEY = re_...
   WAITLIST_TO    = escape.travel.ai@gmail.com
   WAITLIST_FROM  = onboarding@resend.dev
   ```

4. Redeploy. Environment variables are read at request time, but a running
   deployment keeps the old values, so it needs a new one.

`onboarding@resend.dev` is Resend's shared sender and needs no DNS at all, but
it can only deliver to the address that owns the Resend account. Once
`escapetravel.site` is verified in Resend, change `WAITLIST_FROM` to something
like `hello@escapetravel.site` and it can deliver anywhere.

Applications arrive with `reply-to` set to the applicant, so answering the
email answers the person.

### Checking that it took

```
curl https://www.escapetravel.site/api/waitlist
```

`{"configured":false,"mode":"none"}` means nothing is set yet.
`{"configured":true,"mode":"email"}` means it will send. No secret is exposed
either way. If delivery then fails, the reason Resend gave is in the function's
log in the Vercel dashboard — a rejected sender domain and an outage look
nothing alike there.

### While nothing is configured

The endpoint answers `503 {configured:false}`. The form asks it on open, so the
button reads "Подготовить письмо" rather than "Отправить заявку", and submitting
composes an email the visitor sends instead of accepting an address into a black
hole. Nothing is ever posted when the answer is already known to be no.

## Data and privacy

No analytics, no advertising scripts, no third-party embeds, no external font
CDN. The site stores the language choice, the cookie decision, and a waitlist
application only as a local draft until it is delivered. The visitor's IP is
used briefly to throttle automated submissions and is not stored with the
entry. Consent is granular and refusing is as easy as accepting.

## Imagery

Twenty-four photographs. Nineteen are Unsplash-licensed, fetched at q80 — the set was
re-encoded from q58 after the artefacts showed on the sea and the sky. Each
one is used at most twice on the page, and never twice as a section
background; only five sections carry a full-bleed photograph at all. The rest
are given a ground of their own — two very low light sources in the brand's
blue and red — because a page where every section reaches for stock imagery
reads as filler.

Five are the operator's own renders at 1672×941, re-encoded to webp without
upscaling: the hero, the community, the evening coast, the road and the
terrace. No photograph is used as more than one section background.

The remaining image is the operator's app-icon artwork — the app icon with the
wordmark cropped away, used at its native 950px in the proactivity section.

Pictures have to be true to the copy beside them: the layover story runs
JFK to Manhattan, so the photograph is New York, and the proactive nudge
names Santorini because Santorini is what the picture beside it shows.

Contrast over a photograph cannot be computed from CSS alone. `photocontrast.js`
in the QA set hides the text in each photo-backed section, screenshots the bare
ground and measures the real pixels behind every line — currently no failures at
1440px or 390px, worst margin 3.56:1 against a 3:1 requirement.

## Content rules observed

No fake App Store links, partnerships, integrations, reviews, user counts or
live booking data. The page shows what the product does, not how large the
market is — market sizing, the growth loop and the platform vision belong in
a deck, not here. Every block that is not live yet carries a status label.

## Local preview

```
python3 -m http.server 8080
```

Root-relative paths are used throughout, so serve from the repository root.
`python3 -m http.server` does not run `api/waitlist.js`; use `vercel dev` when
you need the endpoint.

## Tooling

```
node tools/stamp.js       # re-hash asset URLs — run after editing anything in assets/
node tools/prerender.js   # bake the legal text into the pages — run after editing legal-docs.js
```

`stamp.js` derives each `?v=` from the file's own SHA-256, so a deploy can never
be masked by a browser holding the previous CSS or JS. `prerender.js` needs
playwright and a running server (`BASE=http://127.0.0.1:8080`); without it a
reader with JavaScript off sees an empty legal page.

## Operator

DMYTRO SUKHYNA · Greece (EU) · escape.travel.ai@gmail.com · support 10:00–19:00 UTC+3
