# Ghana House v2 — Deployment & Notes

## What you got

A complete 7-page static site with:

- **Real Ghana House logo** (extracted from your existing site — `logo.png`, `logo-light.png` for dark backgrounds, `favicon.png`)
- **Ghanaian heritage integrated** — the red/gold/green flag colors from your logo are used as accent moments throughout: header underline, card hover stripes, footer top stripe, page-hero accents, value-card borders, "open now" status indicator, etc.
- **7 separate pages** with proper URLs:
  - `/` — Home
  - `/services` — Full services list
  - `/shop` — Product grid with category filters
  - `/booking` — WhatsApp-only booking with how-it-works
  - `/visit` — Hours, address, transit/parking info
  - `/about` — Brand story emphasizing Ghana heritage
  - `/faq` — 10 frequently asked questions
- **Shared CSS and JS** (`styles.css`, `script.js`) — edit once, applies everywhere
- **Bilingual NL/EN** with toggle (preference stored in localStorage)
- **noindex meta tag on every page** — Google won't index until you flip it off

## How to deploy (5 minutes)

### Netlify drag-and-drop
1. Log in to Netlify → your `ghanahouse` site
2. Go to **Deploys** tab → at the bottom you'll see a drag-and-drop area
3. **Select ALL files in the `v2` folder** (index.html, services.html, shop.html, booking.html, visit.html, about.html, faq.html, styles.css, script.js, robots.txt, logo.png, logo-light.png, favicon.png) — drag them all together into the drop zone
4. Wait ~15 seconds for the deploy
5. Visit ghanahouse.nl — you'll see the new site, with `/services`, `/shop`, etc. all working as clean URLs (Netlify auto-maps `.html` files)

### Don't drag this README or these instructions
You don't need `DEPLOY.md` on the live site — keep it locally as your reference.

## What changed vs the old live site

### Removed (the destructive stuff)
- **Fake booking form** that sent customer data into a black hole
- **Newsletter popup** that aggressively covered the page
- **Curator.io Instagram embed** (~€25/mo dependency)
- **Facebook SDK** tracking script
- **Expired** "10% korting bij Vicky" promo banner
- **Fake `href="#"` SPA navigation** that broke browser back button

### Added / Fixed
- Real anchor URLs (`/services`, `/shop`, etc.) — work with browser back, deep-linkable, indexable per page
- WhatsApp-only booking with localized pre-filled messages (NL/EN)
- 8 placeholder products with WhatsApp-to-order buttons (clicking sends to WA with product name + price + address prompt)
- Proper LocalBusiness JSON-LD schema for Google
- hreflang tags for NL/EN
- HTML lang attribute set correctly + JS-driven swap
- Real-time open/closed indicator
- "Today" highlight on opening hours
- Mobile-responsive header with hamburger menu
- Minimal cookie consent banner (only stores language preference, no tracking)
- noindex meta tags on every page (so Google doesn't index a half-finished site)

### Preserved + amplified
- The actual Ghana House logo (extracted from your live site)
- Ghanaian flag colors (red #CE1126, gold #E8B53D, green #005B36) integrated as accent moments
- Brand identity: cream/black/gold palette + warmer earth tones
- Playfair Display italic + DM Sans typography pairing
- Address: Korte Haaksbergerstraat 19, 7511 JV Enschede
- WhatsApp number: +31 6 8703 0400
- Opening hours

## What to update BEFORE flipping noindex off (when ready to launch)

These are the placeholders that need real data before you let Google in:

### 1. Product data (`shop.html` and `index.html`)
Search for `<!-- Product` comments. For each product card, update:
- The text inside `<div class="product-visual-text">` (until you add real photos)
- The `<div class="product-category">` text
- The `<h3 class="product-name">` text
- The `<div class="product-price">` value
- The `data-product` AND `data-price` attributes on the order button (these control the WhatsApp message)

### 2. Real product photos (eventually)
Replace each `<div class="product-visual bg-X">...</div>` with `<img src="/path/to/photo.jpg" alt="Product name" class="product-visual" />`. Photos should be square (1:1), at least 600×600px, JPG or WebP, under 200KB.

### 3. Service prices (`services.html` and `index.html`)
Verify the 9 services in `services.html` and 3 services in `index.html` match your actual pricing. Update the `<div class="service-price">` and descriptions if needed.

### 4. About page facts (`about.html`)
- Verify "since 2014" matches your actual opening year
- Adjust the brand story copy to reflect what you actually want to say

### 5. FAQ answers (`faq.html`)
Verify all 10 FAQ answers match your actual policies — especially:
- Cancellation policy
- Shipping zones (currently says NL + BE)
- Payment methods (currently lists cash/pin/Tikkie/iDEAL/card/Bancontact)

### 6. Opening hours (if they've changed)
Update in TWO places:
- The `<table class="hours-table">` in `visit.html`
- The `schedule` JavaScript object in `script.js`
Both must match.

## When you're ready to launch (let Google index)

1. In every `.html` file: delete the two `<meta name="robots" content="noindex...">` lines near the top
2. Replace `robots.txt` with:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://ghanahouse.nl/sitemap.xml
   ```
3. Optionally: create a `sitemap.xml` listing all 7 page URLs
4. Re-deploy to Netlify
5. Submit ghanahouse.nl to Google Search Console

## Project #2 — The admin tab (deferred, not in this build)

You wanted an admin via GitHub + Render to manage emails. That's a separate project from this one. Here's the realistic plan:

### What it requires
- **A backend service** on Render (Node.js or Python, ~€7/mo for the lowest paid tier — free tier sleeps after 15 min of inactivity which won't work for a public form)
- **A database** — Render Postgres add-on, or connect free Supabase
- **An email service** — Resend (free tier: 100 emails/day, 3000/month) or Postmark (~€10/mo)
- **Auth** — so only you can log in (email + password, or magic link)
- **An admin frontend** — pages for viewing/managing whatever the admin needs to do

### What I still need from you to scope it
The single biggest unknown: **what does the admin actually DO?** Pick one or more:

- **(a) View contact form submissions** — requires a contact form first (currently none on the site, all flows go through WhatsApp)
- **(b) Edit products/prices/hours without editing HTML** — this is a CMS use case. Better answer: Decap CMS (free, Git-based, runs entirely on Netlify). I can set this up in 2-3 hours.
- **(c) View incoming emails** — that's just your Gmail/Outlook account. No backend needed.
- **(d) Send marketing emails** — separate tool (Mailchimp free tier, Brevo free tier).
- **(e) Track bookings/orders made through WhatsApp** — manual data entry into a Google Sheet or Notion is realistic for current volume; an admin doesn't help unless customers are submitting through the website.

### My recommendation
Live with this static site for **2-4 weeks**. Track which problems actually appear:
- Are you missing customer messages? (Gmail/WhatsApp issue, not admin issue)
- Are you forgetting bookings? (Google Calendar issue, not admin issue)
- Is editing the HTML painful when prices change? (CMS would help — that's option b)
- Do customers want to fill in a form instead of WhatsApp? (Then build a contact form + small backend — option a)

The answer to "do you need an admin" depends on which of these is actually the bottleneck. Don't build infrastructure for a problem you don't yet have.

When the answer becomes clear, **do the build in Claude Code, not in chat**. Backend work in chat windows produced 4 build failures in a row last time. Claude Code handles it cleanly.

## Known limitations of this version

- **No real e-commerce.** Orders go through WhatsApp. To upgrade: get a Mollie account, create payment links, swap WhatsApp buttons for Mollie URLs. Half-day work.
- **No analytics.** No Plausible or Google Analytics. Add when you want traffic data.
- **No transactional emails.** No order confirmations from the site (those would come from your eventual Mollie payment links).
- **No backend at all.** Cannot store data, send emails, process payments, manage state.
- **No content management.** Editing products/prices/hours requires editing HTML. Until you have a CMS or admin.
- **Bilingual but not internationalized.** NL and EN share the same URL, switched via JS — Google sees the lang attribute but technically both languages live on the same page.

## File map

```
/mnt/user-data/outputs/v2/
├── index.html        — Home
├── services.html     — Services
├── shop.html         — Shop (with category filters)
├── booking.html      — WhatsApp booking + how it works
├── visit.html        — Hours, address, transit/parking
├── about.html        — Brand story + values
├── faq.html          — 10 FAQs
├── styles.css        — Shared stylesheet
├── script.js         — Shared JS (lang toggle, mobile menu, hours, WhatsApp)
├── robots.txt        — Currently blocks all crawling
├── logo.png          — Real Ghana House logo (dark text, for cream backgrounds)
├── logo-light.png    — White text version (for dark backgrounds, used in footer)
├── favicon.png       — 32×32 favicon
└── DEPLOY.md         — This file (don't deploy to Netlify)
```
