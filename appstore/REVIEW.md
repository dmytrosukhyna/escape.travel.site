# Submission notes, ratings and compliance

Everything App Store Connect asks for beyond the listing copy, plus the things
that will decide whether the first submission passes.

The screenshots themselves are captures of the real app, so Guideline 2.3.3 —
screenshots must show the app as it is — is already satisfied in substance.
Everything else below is about the build, and I cannot see the build from here:
this session has the marketing site and the captures, nothing more. So the
sections marked **CONFIRM** are claims somebody has to check against the real
thing before the submission goes in. A wrong answer in App Store Connect is not
a typo; a few of them are grounds for removal later.

---

## 1. Age rating

Answer the questionnaire honestly, and expect **12+ at best**, not 4+.

The reason is the community side. An app where people write profiles and are
matched with strangers to travel together carries user-generated content and
user-to-user contact. Apple's questionnaire asks about both directly, and the
answer moves the rating.

**CONFIRM** before answering:

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

## 10. Before you press submit

- [ ] App screens re-exported at device resolution — the captures in
      `img/app/` are 640px wide and go soft at store size (see `README.md`)
- [ ] `christmas.webp` captured in each language, not just Russian
- [ ] App icon at 1024 × 1024, no alpha, no rounded corners applied by you
- [ ] Demo account filled in and working
- [ ] The backend up and staying up through review
- [ ] Age rating questionnaire answered from the real feature set
- [ ] Report / block / 24-hour response live, if the community ships
- [ ] IAP configured for anything digital, or confirmed that nothing digital is sold
- [ ] `ITSAppUsesNonExemptEncryption` set
- [ ] Privacy labels matched to the real collection, not to this table
- [ ] Account deletion reachable in the app
- [ ] Support URL reachable and monitored
