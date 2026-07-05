# E2E Smoke Test Plan

Playwright is installed and configured through `playwright.config.ts`. Run smoke e2e checks with `npm run test:e2e`.

When an e2e runner is approved, start with smoke coverage before visual snapshots.

## Candidate Specs

### `auth.spec.ts`
- login screen renders
- email login form opens
- signup flow advances through agreement, email, nickname, password, age, and category screens
- verification code timer appears after sending a code

### `news-detail.spec.ts`
- home news detail opens
- detail back button returns to the feed
- comment panel can be reached
- vote option can be selected without changing layout

### `search.spec.ts`
- search screen opens from toolbar
- result selection navigates to the correct target
- body highlight scrolls into view

### `my-page-settings.spec.ts`
- my page opens after authentication state is available
- profile settings screen opens and returns
- custom news settings screen opens
- blocked keyword add, toggle, and delete actions update the UI

## First Pass Criteria

- Prefer deterministic mock data.
- Avoid visual snapshots in the first pass.
- Assert stable roles, labels, or visible text where available.
- Do not rely on animation timing except where the UI already requires it.