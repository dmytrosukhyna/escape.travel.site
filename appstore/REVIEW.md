# Submission notes, ratings and compliance

**The app is already on the App Store.** `Escape: AI Travel Agent`, Dmytro
Sukhyna, id `6803238502` — first released 1 November 2026, currently at 1.0.5
(15 November), free, rated 17+, listed under Travel and Navigation, with nine
screenshots and six device languages.

So this is not a first submission. It is the New Year update, and most of what
follows is already settled: the age rating was answered, export compliance was
declared, the privacy labels exist. What is below is what to check before 1.0.6
goes up, and what the live listing is currently missing.

## 0. What the live listing is missing today

Read back from the store on 18 November 2026:

| Storefront | Listing language now |
|---|---|
| Russian | Russian ✓ |
| Spanish | Spanish ✓ |
| US / English | English ✓ |
| Greek | **English** — Greek copy never uploaded |
| Croatian | **English** — Croatian copy never uploaded |
| Ukrainian | **English** — Ukrainian copy never uploaded |

The app itself ships in all six. Three storefronts are selling it in a language
the reader may not have. `LISTING.md` has the Greek, Croatian and Ukrainian
copy ready to paste.

The nine screenshots on the store are the raw captures — no frame, no caption,
nothing seasonal. The set in this folder replaces them.

The release notes live on the store are about "Escape finds" boutique hotels,
which is 1.0.5. `LISTING.md` has the New Year text for 1.0.6.

The screenshots themselves are captures of the real app, so Guideline 2.3.3 —
screenshots must show the app as it is — is already satisfied in substance.
Everything else below is about the build, and I cannot see the build from here:
this session has the marketing site and the captures, nothing more. So the
sections marked **CONFIRM** are claims somebody has to check against the real
thing before the submission goes in. A wrong answer in App Store Connect is not
a typo; a few of them are grounds for removal later.

---

## 1. Age rating — already answered

The live listing is **17+**, which is the honest answer for an app with
traveller profiles and matching, and it does not need revisiting for this
update unless the feature set changes.

Worth knowing: 17+ costs reach. If the community side is moderated — filtering,
reporting, blocking, a real 24-hour response — the questionnaire can honestly
support a lower rating, and that is a conversion question worth a separate look
rather than a change to make in a hurry.

**CONFIRM** if you ever revisit it:

- Is the community feature in the first build at all? If it is not, say so and
  the rating drops accordingly — but then the listing must not show it either,
  and the "TOGETHER" paragraph and the companion screen come out.
- Is there a way to report content and to block another user?
- Is there moderation, and who does it?

## 2. Guideline 1.2 — user-generated content

This is the single most likely cause of a first-draft rejection.

If the app ships with profiles, posts or traveller matching, Apple requires
**all four** of these, and checks for them:

1. A filter that keeps objectionable material out before it is published.
2. A way for a user to flag content, in the app, in no more than a tap or two.
3. A way to block an abusive user.
4. Published contact details for the developer, and a commitment to act on a
   report within 24 hours — removing the content and ejecting the user who
   posted it.

The site already publishes Community Guidelines and a contact address, which
covers the published half. **CONFIRM** that reporting, blocking and the 24-hour
response exist in the app and that somebody is actually on the other end of
them. Shipping matching without blocking will not pass.

## 3. Guideline 1.2 again — the agent writes the text

The agent generates itinerary text from a model. Apple treats generated content
as content the app is responsible for. Have a filter on what the model can
return, and a way for a user to report an output that is wrong or offensive.

## 4. Guideline 3.1.1 — payments

Travel is a real-world service, so flights, hotels and tables are **exempt from
In-App Purchase** and may be paid for outside the app. That exemption does not
extend to anything digital.

**CONFIRM**: if there is any subscription, paid tier, credit pack or
"unlock" of app features, it must go through In-App Purchase. Taking card
details in-app for a feature unlock is a rejection.

## 5. Guideline 2.1 — a reviewer has to be able to use it

**CONFIRM** and fill in App Review Information:

- A demo account with a password, if anything is behind a login. Reviewers do
  not sign up.
- If the agent needs a live backend, it has to be up for the whole review.
- If any feature is region-locked, say which region to test from.

Suggested **Notes for Review**:

> Escape! is an AI travel agent. A user describes a trip in one sentence and the
> agent assembles the flight, the stay, the route and the timing, then adjusts
> the plan during the trip.
>
> Demo account: <e-mail> / <password>
>
> To see the main flow: open the app, type or dictate "Paris for the weekend,
> hotel in the centre, up to €1,500", and the assembled trip appears on the home
> screen. The New Year section is on the same screen.
>
> Bookings are completed with the travel provider, outside the app. Escape! is
> not a carrier, hotel or tour operator and takes no payment for travel. This is
> set out in the app and at escapetravel.site/disclaimer.html.
>
> Reports of user content go to escape.travel.ai@gmail.com and are acted on
> within 24 hours.

## 6. Guideline 4.2 — not a wrapped website

A travel app that is a web view over a site gets rejected. **CONFIRM** the app
is native and does things a website cannot — notifications when a price moves,
live itinerary changes, offline access to the plan.

## 7. Export compliance

The app uses HTTPS/TLS provided by the operating system and no encryption of
its own.

- *Does your app use encryption?* — **Yes**
- *Does it qualify for the exemptions?* — **Yes** (standard encryption
  provided by the OS, used only for the app's own traffic)

Then add to `Info.plist`, so the question is answered automatically from then on:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

**CONFIRM** this is true. If the app ships its own crypto, or encrypts stored
data with something other than the OS keychain and file protection, the answer
changes and a CCATS/self-classification filing may be needed.

## 8. Privacy — the nutrition label

The labels must match what the app actually collects. Guessing here is how a
listing ends up wrong.

Based on what the product does, expect to declare:

| Data | Linked to user | Used for | Why |
|---|---|---|---|
| E-mail address | Yes | App functionality, account | Sign-in, the waitlist, the agent writing to you |
| Name | Yes | App functionality | On the traveller profile |
| Coarse location | Yes | App functionality | Departure city, "an hour from home" |
| Precise location | **CONFIRM** | App functionality | Only if live routing uses it |
| Purchase history | **CONFIRM** | App functionality | Only if bookings are recorded in-app |
| User content | Yes | App functionality | Trips, saved places, community posts |
| Search history | Yes | App functionality, personalisation | What the agent remembers about you |
| Identifiers (user ID) | Yes | App functionality | |
| Usage data | **CONFIRM** | Analytics | Only if analytics ship in v1 |
| Diagnostics | **CONFIRM** | App functionality | Only if crash reporting ships |

**CONFIRM**: no data is used for tracking across other companies' apps. If any
advertising or attribution SDK is in the build, that becomes "Tracking", and
App Tracking Transparency and its prompt are required.

**CONFIRM**: account deletion from inside the app. Guideline 5.1.1(v) requires
it for any app that creates an account, and it must delete the account, not
just sign out.

## 9. What is already in place on the site

The privacy policy, terms, cookie policy, AI and travel disclaimer and
community guidelines are published in three languages and linked from the
footer, and the URLs in `LISTING.md` resolve. The terms state plainly that a
mention of a brand is not a partnership or an integration unless stated, and
the disclaimer states that bookings happen with the provider under the
provider's own conditions.

**One gap worth closing before launch, not before submission:** there is no
affiliate or commission disclosure anywhere, because there is no affiliate
arrangement yet. The moment Escape! earns a commission on a booking it
recommends, that has to be disclosed — in the app, in the terms, and under the
FTC and EU rules on undisclosed commercial relationships. Worth drafting the
clause now so it is ready rather than retrofitted.

## 10. Before 1.0.6 goes up

Already done, from 1.0.5 — no action:

- Age rating answered (17+)
- Export compliance declared
- Privacy labels filed
- App icon accepted

For this update:

- [ ] App screens re-exported at device resolution — the captures in
      `img/app/` are 640px wide and go soft at store size (see `README.md`)
- [ ] `christmas.webp` captured in each language, not just Russian
- [ ] New screenshots uploaded for 6.9″ and 6.5″, all six languages
- [ ] Greek, Croatian and Ukrainian listings filled in from `LISTING.md` —
      they are English on the store today
- [ ] Release notes replaced with the New Year text
- [ ] Promotional text set (it changes without a new build, so it can carry the
      season and be swapped back in January)
- [ ] Demo account still valid and the backend up through review
- [ ] Anything new in 1.0.6 that collects data reflected in the privacy labels
- [ ] If the New Year section books anything digital, IAP — travel itself stays
      exempt
