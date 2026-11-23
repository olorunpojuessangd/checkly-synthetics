# Raccoon Synthetics: Checkly Monitoring as Code

This repository runs all of your synthetic monitoring on Checkly, defined in code and deployed with the Checkly CLI. It includes your two Playwright checks (now fixed and passing), API checks generated automatically from a JSON file, two check groups, and email alerts for any failure.

## What's monitored

| Group | Checks | Runs | Locations |
| --- | --- | --- | --- |
| Playwright Checks | Shopping flow on automationexercise.com; PokeAPI "favorite Pokemon is electric type" | Every hour | US East (N. Virginia), EU West (Ireland) |
| User API Checks | One check per user in `users.json` (currently John Doe, Ruby Smith, Tina Johnson) | Every 10 minutes | US East (N. Virginia), EU West (Ireland) |

If any check fails, an email goes to **raccoon@checklyhq.com**. You'll also get an email when it recovers.

## Project structure

```
__checks__/
  alert-channels.ts              Email alert channel (raccoon@checklyhq.com), shared by both groups
  playwright/
    playwright-group.check.ts    "Playwright Checks" group: picks up every .spec.ts file in this folder
    shopping-flow.spec.ts        Your shopping test (fixed)
    pokemon-type.spec.ts         Your PokeAPI test (fixed)
  api/
    users.json                   The users to monitor: one API check is created per entry
    user-api.check.ts            "User API Checks" group and the reusable createUserApiCheck() function
checkly.config.ts                Project-wide settings (name, runtime, which files count as checks)
screenshots/                     Dashboard screenshots of the deployed setup
```

## Getting started

You'll need Node.js 18 or newer and a Checkly account.

```bash
npm install
npx checkly login
npx checkly env add API_TOKEN <your-api-token> --secret
```

The last command stores your API token as a **secret** environment variable in your Checkly account. The code only ever refers to it by name (`{{API_TOKEN}}`), so the token never appears in this repository, in logs or in the dashboard.

## Test, preview, deploy

```bash
npx checkly test --record    # Run every check once in Checkly's cloud. Nothing is saved to your account.
npx checkly deploy --preview # List exactly what a deploy would create, change or delete.
npx checkly deploy           # Create or update the real, scheduled checks.
```

`--record` uploads each test run with screenshots, a video and a step-by-step trace, which makes debugging much faster.

## Adding a Playwright test

Save a new `.spec.ts` file in `__checks__/playwright/` and run `npx checkly deploy`. That's it: the group discovers it automatically, and it inherits the group's schedule, locations and alerts. No configuration changes are needed.

## Adding an API check

Add a user to `__checks__/api/users.json` and run `npx checkly deploy`:

```json
{
  "id": 99,
  "name": "New User",
  "profile_url": "https://jsonmap-faiy.onrender.com/api/v1/items/user99"
}
```

`createUserApiCheck()` turns each entry into an API check that sends your token and asserts that:

- the response status is **200**, and
- the response's `id` and `name` match the values in `users.json`.

The function is exported, so you can reuse it for any other user list or group.

## Alerts

The email channel is defined once in `__checks__/alert-channels.ts` and attached to both groups. To change the address, edit that file and redeploy.

One thing worth knowing: with `CheckGroupV2`, a group's `alertChannels` only apply to its checks when the group also sets an `alertEscalationPolicy`. Without it, each check falls back to its own (empty) alert settings. Both groups set `AlertEscalationBuilder.runBasedEscalation(1)`, which alerts after one failed run.

## What was wrong with the original checks

**Shopping flow**

- The three `expect(...).toBeVisible` lines were missing `()` and `await`, so they never actually checked anything. A test whose assertions can't fail gives false confidence.
- "Continue Shopping" is a **button**, not a link, so the test timed out looking for a link with that name.
- The checkout popup's link reads **"Register / Login"**, not "Register / Signup".
- The cookie-consent check used `isVisible()`, which looks once and doesn't wait. The consent popup appears for runs from EU locations and can load late, so it's now handled with `page.addLocatorHandler()`, which dismisses it whenever it appears.
- The "Products" link name contained a hidden icon character copied from the page; it now matches on the plain text.
- The test was renamed from `'test'` so alert emails say what broke.

**PokeAPI**

- `toBeOK()` checks weren't awaited, so a failed response could slip through unnoticed.
- `forms` is a list, so `forms.url` was `undefined`. The next request then went to an invalid URL, which caused the "Invalid URL" error. It's now `forms[0].url`.
- `types[0].type` is an object (`{ name, url }`), so comparing it to `'electric'` always failed. It's now `types[0].type.name`.
- Added a check that the favorite Pokemon was actually found, so a missing entry fails with a clear message.

## Notes

- **Please rotate your API token.** It was shared in a support chat, so it's safest to generate a new one, then update it with `npx checkly env update API_TOKEN <new-token> --secret`. Nothing in the code needs to change.
- **The profile API can be slow to wake up.** It's hosted on Render, whose free tier sleeps when idle, so the first request can take much longer than usual. The API checks allow up to 30 seconds (`maxResponseTime`) and flag anything over 10 seconds as degraded, so a cold start shows as slow rather than as a false outage.
- **Schedules and locations are easy to change** in each group file: `frequency` and `locations`.

## Screenshots

- [Monitors: both groups and all checks](screenshots/monitors.png)
- [Alert channels: raccoon@checklyhq.com subscribed](screenshots/alert-channels.png)

## How AI was used

I used Claude as a pair to plan the setup and review fixes. Every change was confirmed with real runs in Checkly (`npx checkly test --record`), using the recorded traces and videos to find each failure's cause.

## Useful docs

- [Checkly CLI overview](https://www.checklyhq.com/docs/cli/)
- [Check groups (CheckGroupV2)](https://www.checklyhq.com/docs/constructs/check-group-v2/)
- [API checks](https://www.checklyhq.com/docs/constructs/api-check/)
- [Including checks with testMatch and checkMatch](https://www.checklyhq.com/docs/constructs/including-checks/)
- [Secrets and environment variables](https://www.checklyhq.com/docs/platform/secrets)
- [Alert channels](https://www.checklyhq.com/docs/constructs/alert-channel/)