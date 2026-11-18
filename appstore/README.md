# App Store assets — ESCAPE! AI Travel Agent

Built by `tools/appstore.js` from the app's own screens in `img/app/<lang>/`.
Re-run it after new captures or a copy change and the whole set follows:

```
node tools/appstore.js
```

## What is here

60 files: six languages × two sizes × five frames.

| Size | Pixels | Required for |
|---|---|---|
| `*-6.9-*.png` | 1320 × 2868 | 6.9″ display (iPhone 16 Pro Max) |
| `*-6.5-*.png` | 1284 × 2778 | 6.5″ display (iPhone 14/15 Plus) |

App Store Connect requires one set at each of those two sizes; every other
device size is scaled from them automatically.

Languages: `ru`, `uk`, `en`, `el`, `hr`, `es` — the six the app ships in.

**The screens are real.** They are the captures in `img/app/<lang>/`, not
drawings of the app, which is what App Review Guideline 2.3.3 asks for. The
captions are the site's own alt text for those same screens (the `shot*` keys
in `assets/i18n.js`), so they are already translated into all six languages and
they already describe what is on the screen rather than promising something
that is not.

The five frames run through the same evening the site does — dawn on the first,
night on the last — with the garland over the top and snow across all of them.

## Two things to fix before these go up

**1. The captures are 640px wide.** Blown up to fill a 1320px frame they are
soft, and the App Store gallery shows screenshots large. Re-export them from
the simulator at device resolution — 1320 × 2868 for the 6.9″ capture — and
drop them into the same folders under the same names. This tool picks up
whatever is there, so nothing else needs changing and the output gets sharp.

**2. `christmas.webp` is the Russian capture in all six folders.** Every other
screen is properly localised; that one was never re-captured. So the Russian
set leads with the New Year screen and the other five languages do not — they
fall back to five screens that genuinely are in their language, and the tool
prints which ones did that when it runs.

That is the wrong way round for the season: the New Year screen is the one
worth leading with everywhere. Capture it in each language, drop the files in,
re-run, and the festive set comes back on its own with no code change.

## Making changes

| What | Where |
|---|---|
| Which screens, and their captions | `FESTIVE` / `PLAIN` in `tools/appstore.js` |
| The caption wording | The `shot*` keys in `assets/i18n.js` — shared with the site |
| The colour each frame sits on | `SKY` in `tools/appstore.js` |
| Languages and sizes | `LANGS` and `SIZES` in the same file |
| The phone frame | `.device` / `.device--shot` in `assets/styles.css` — one definition, used by the site and by these |

## Also in this folder

- `LISTING.md` — every field App Store Connect asks for, per language.
- `REVIEW.md` — age rating, the user-content rules, payments, export
  compliance, the privacy labels, and the checks that have to happen against
  the real build before submitting.
