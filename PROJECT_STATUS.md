# Kuźnia Figur — project status

Fake-door test site for a Polish business selling handmade welded kinetic
figurines (balance toys made from nuts, bolts, and wire). The goal is to
measure real demand — via ad traffic, email signups, and engagement — before
committing to building actual production capacity. Only one product
(Linoskoczek) is real right now; everything else is "coming soon."

## Stack

Plain static HTML/CSS/vanilla JS. No build step, no framework, no bundler.

- [index.html](index.html) — homepage
- [linoskoczek.html](linoskoczek.html) — the one live product page
- [styles.css](styles.css), [script.js](script.js) — shared across both pages
- `images/*.webp` — real product photos
- [robots.txt](robots.txt), [sitemap.xml](sitemap.xml), [404.html](404.html), [favicon.svg](favicon.svg) — SEO basics

**History:** this replaced an earlier version built with a proprietary
"Claude Design" `.dc.html` format (client-side React+Babel pulled from a CDN
at request time — zero crawlable content, no meta tags, slow). That original
version is preserved in the first commit (`0d6ca25`) if it's ever needed
again, but the live site is the static rewrite.

## Domain & hosting

- Domain: `kuzniafigur.pl` (owned by the user)
- Hosting: **home.pl shared hosting** (not GitHub Pages — that was tried and
  abandoned early on)
- SFTP: host `serwer2691768.hosting-home.pl`, port 22, user
  `ftpuser1@kuzniafigur.pl`, remote web root `/public_html`
- **Deployment is currently manual** — upload changed files via WinSCP
  (saved session credentials, not stored in the repo). There is no deploy
  script in the repo right now; a GitHub Actions auto-deploy workflow and a
  local `deploy.ps1` were both built and then deleted by the user. Reason: the
  GitHub Actions attempt failed because home.pl's network blocks SFTP
  connections from GitHub-hosted runner IPs (Azure datacenter range) —
  confirmed via a fast reachability-check step, it was a network timeout, not
  a credentials problem. Options discussed but not decided: keep manual
  WinSCP forever, or set up a self-hosted GitHub Actions runner on the user's
  own PC to route around the IP block.
- GitHub repo: `https://github.com/chejroo/figures` (public), branch
  `master`. This is version history/backup — pushing does **not** deploy
  anything right now.

## Analytics (GA4)

- Measurement ID `G-BTCXJ7RS1F`, wired into both HTML files' `<head>`.
- Custom events fired from [script.js](script.js):
  | Event | Fires when | Params |
  |---|---|---|
  | `cta_click` | any "Sprawdź dostępność" button, or the Linoskoczek homepage card | `label` |
  | `interest_click` | clicking a "coming soon" card (Golfista/Wędkarz) | `figure` |
  | `lead_submit` | form successfully submitted to Formspree | `figure` |
  | `lead_submit_error` | Formspree request failed | `figure` |
  | `modal_abandon` | modal closed without submitting | `figure` |
  | `section_view` | each homepage section scrolls into view (once) | `section` |
- Plus GA4's automatic Enhanced Measurement (scroll, outbound clicks, etc.)
- **Not yet done:** marking `lead_submit` (and maybe `interest_click`) as key
  events/conversions in the GA4 admin panel — manual panel step, not code.

## Lead capture

The "Sprawdź dostępność" form POSTs to **Formspree**
(`https://formspree.io/f/mbdnloeg`) which forwards to `kontakt@kuzniafigur.pl`.

History: first wired to FormSubmit.co, which turned out to be down
(persistent 500 errors across multiple checks) — switched to Formspree
instead, endpoint provided directly by the user.

**Important:** Formspree requires a one-time confirmation — the first real
submission triggers a confirmation email to `kontakt@kuzniafigur.pl` that
must be clicked before submissions actually get delivered. Unclear as of the
last session whether this had been done yet — verify before trusting that
leads are actually arriving.

Client-side details: honeypot field (`company`) silently drops bot
submissions before ever calling fetch; submit button disables during the
request; success only shows (and `lead_submit` only fires) after a real
`ok` response from Formspree; failure shows an inline alert pointing at the
direct email address and fires `lead_submit_error` instead.

## Product scope

Only **Linoskoczek** (180 zł) is a real, navigable product page. Golfista and
Wędkarz show as non-clickable "coming soon" cards on the homepage — except
they *are* clickable in the sense that clicking fires `interest_click` (to
gauge demand) with inline "Zgłoszono zainteresowanie ✓" feedback, they just
don't navigate anywhere.

An "Akrobata" product and fully-built Golfista/Wędkarz detail pages existed
in the original `.dc.html` version but were **deleted** during the rewrite —
they were orphaned/unlinked and contradicted the "coming soon" homepage
messaging. If/when those products go live for real, the old markup is
recoverable from commit `0d6ca25` as a starting point.

## Known open items

1. Confirm the current `master` is actually deployed to home.pl (last known
   state: several commits ahead of what was last manually uploaded via
   WinSCP — button-sizing fix and the Formspree switch may not be live yet).
2. Confirm the Formspree activation email was clicked.
3. Mark GA4 key events (see above).
4. Add UTM parameters to any ad campaign links before spending — GA4 picks
   these up automatically but only if the ad URLs actually include them.
5. No privacy policy page exists yet. Worth adding given a third party
   (Formspree) now processes visitor email addresses and this is a Polish
   (GDPR-scoped) business.
6. Deploy automation is unresolved (see Hosting section) — decide whether to
   live with manual WinSCP uploads or invest in a self-hosted runner.

## Working notes for future sessions

- The user communicates directly and can get frustrated fast when something
  important (like lead capture actually working) turns out to be a stub —
  treat `TODO`s in code as high-priority, not decorative.
- Any change that sends visitor data (PII) to a third-party service needs
  the user to explicitly name/approve that specific service first — don't
  pick one unilaterally, even under pressure to "just fix it." This
  triggered an actual safety block once already.
- The user tests and iterates fast over chat with real screenshots/console
  output from GA4, GitHub Actions, WinSCP, etc. — verify claims against
  what they paste rather than assuming the last known state still holds.
- Always verify changes in an actual browser (local static server +
  browser automation) before pushing, especially anything CSS/layout or
  form-submission related — several real bugs were caught this way (a
  `[hidden]` CSS specificity bug, undersized buttons from a missing
  modifier class).
