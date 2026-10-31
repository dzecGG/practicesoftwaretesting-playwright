# Practice Software Testing: Playwright Test Framework

![Playwright Tests](https://github.com/dzecGG/practicesoftwaretesting-playwright/actions/workflows/playwright.yml/badge.svg)

**[View the latest test report](https://dzecgg.github.io/practicesoftwaretesting-playwright/)**

A Playwright and TypeScript test framework for [Practice Software Testing](https://practicesoftwaretesting.com), a demo tool shop with a website, a REST API and an admin area. The suite tests the UI and the API together, creates its own test data, follows an order from checkout to shipping across customer and admin, and runs in GitHub Actions against its own Docker copy of the app.

## What this project shows

- **UI and API testing in one suite:** page objects for the website, an API client for the REST API, and tests that use both
- **Login once per role:** a setup project logs in as a customer and as the admin, then every test reuses the saved sessions
- **Custom fixtures:** tests ask for what they need (`api`, `newCustomer`, `customerPage`, `adminPage`) instead of setting it up themselves
- **Test data created per test:** tests that need a fresh customer register one through the API with Faker, so they never share accounts
- **End-to-end business flow:** Order to Cash across two roles, with API checks at each handoff
- **Network mocking:** faked API responses test error states the real site can't produce on demand
- **Two environments, same tests:** the normal site and a version with planted bugs
- **Accessibility checks** with axe against WCAG 2 A and AA
- **CI/CD:** smoke tests on every push, the full suite nightly, split across two machines, with the HTML report published online
- **AI-assisted testing with human review:** Playwright's planner, generator and healer agents drafted the favorites tests, then I refactored and reviewed them

## Order to Cash

[`tests/e2e/order-to-cash.spec.ts`](tests/e2e/order-to-cash.spec.ts) is the showcase test. A customer places an order in the website, the test checks the invoice through the API, the admin ships the order in the admin screens, and the customer's own API login confirms the invoice now shows `SHIPPED`.

| ERP (NetSuite) | This test |
| --- | --- |
| Sales order | The order placed at checkout |
| Invoice | The invoice the site creates, with its `INV-` number |
| Payment | Cash on delivery |
| Fulfillment | The admin changing the status to `SHIPPED` |

## Defects found

| Defect | Found by | Expected | Actual |
| --- | --- | --- | --- |
| Home page shows no error when products fail to load | [`products.mock.spec.ts`](tests/mocking/products.mock.spec.ts), marked `test.fail()` | An error message | Loading placeholders that never go away |
| Category filter lists are built wrongly (WCAG 1.3.1, level A) | [`home.a11y.spec.ts`](tests/a11y/home.a11y.spec.ts) | Each `<ul>` contains only `<li>` items | A `<fieldset>` sits directly inside each sub-list's `<ul>` |

Known defects stay visible in every report: each failing check carries a `bug` annotation explaining it.

## Problems solved along the way

| Problem | Cause | Fix |
| --- | --- | --- |
| Every CI test timed out | The site's Cloudflare bot check challenges GitHub's servers | CI starts its own copy of the app with Docker and tests that |
| The Docker copy returned 500 when listing products | The app runs as user 1000, but GitHub's runner owns the files as user 1001, so the API couldn't write its cache | The workflow opens up the app's storage folders, as the app's own production image does |
| Checkout never reached the invoice | Payment uses the same button twice: "Check payment", then "Confirm" | The checkout page object clicks twice and waits for the button to change in between |
| The invoice number locator never matched | Angular removes `id` attributes from inserted HTML | The page object reads the `INV-` number from the confirmation message |
| Checkout stopped at Billing Address | The form requires a house number, which the test customers didn't have | The customer builder adds one |

## How it's built

```
Tests (UI, API, end-to-end, setup)
  └─ ask for fixtures: page, customerPage, adminPage, api, newCustomer
      └─ which use helpers: page objects, ApiClient, Faker test data, saved logins
          └─ which talk to the site: website and REST API
```

Only the helpers know about locators and endpoints. When the site changes a `data-test` value or an API path, one file changes and every test keeps working.

| Fixture | Gives the test |
| --- | --- |
| `page` | A browser with nobody logged in |
| `customerPage` | A browser logged in as a customer (saved login) |
| `adminPage` | A browser logged in as the admin (saved login) |
| `api` | The API client |
| `newCustomer` | A newly registered customer with email, password and login token |

## Test coverage

| Area | Folder | Covers |
| --- | --- | --- |
| Login | `tests/ui/login.spec.ts` | Successful login, wrong password, saved customer and admin logins |
| Products | `tests/ui/products.spec.ts` | Opening a product from the home page, search |
| Cart | `tests/ui/cart.spec.ts` | Adding a product and seeing it in the cart |
| Favorites | `tests/ui/favorites/` | The scenarios in `specs/favorites.md` (generated by the agents, then refactored) |
| Products API | `tests/api/products.api.spec.ts` | Paging, sorting, single product, unknown product (404) |
| Users API | `tests/api/users.api.spec.ts` | Login token, duplicate email (409), weak password (422), lockout after three wrong passwords (423) |
| Order to Cash | `tests/e2e/order-to-cash.spec.ts` | Customer order, invoice check, admin shipping, customer sees status |
| Error states | `tests/mocking/products.mock.spec.ts` | Empty product list, product list server error |
| Accessibility | `tests/a11y/home.a11y.spec.ts` | Home page against WCAG 2 A and AA |
| Visual | `tests/visual/login.visual.spec.ts` | Login form screenshot comparison (local only) |

## Project structure

```
.
├── .github/workflows/playwright.yml   # smoke on push, full suite nightly, sharded, report published
├── .claude/agents/                    # Playwright agent definitions (planner, generator, healer)
├── specs/favorites.md                 # test plan written by the planner agent, reviewed by me
├── src/
│   ├── api/ApiClient.ts               # every API call in one place
│   ├── data/customers.ts              # Faker test data, registers new customers
│   ├── fixtures/test.ts               # api, newCustomer, customerPage, adminPage
│   ├── pages/                         # page objects
│   └── auth.ts                        # saved-login paths, log in by token
├── tests/
│   ├── auth.setup.ts                  # logs in once per role
│   ├── seed.spec.ts                   # starting point for the agents
│   ├── api/                           # API tests (no browser)
│   ├── ui/                            # UI tests, including the favorites tests
│   ├── e2e/order-to-cash.spec.ts      # the showcase test
│   ├── mocking/                       # faked API responses
│   ├── a11y/                          # accessibility checks
│   └── visual/                        # screenshot comparisons
├── .env.example                       # settings the tests read
├── playwright.config.ts               # normal site, or CI's Docker copy
├── playwright.bugs.config.ts          # the version of the site with planted bugs
└── tsconfig.json
```

## Run the tests

You need [Node.js](https://nodejs.org/) (LTS) and Git.

```
git clone https://github.com/dzecGG/practicesoftwaretesting-playwright.git
cd practicesoftwaretesting-playwright
npm ci
npx playwright install
```

Copy the settings file. On Windows PowerShell:

```
Copy-Item .env.example .env
```

On macOS or Linux:

```
cp .env.example .env
```

Then run the suite and open the report:

```
npx playwright test
npx playwright show-report
```

Other useful commands:

```
npx playwright test --project=api
npx playwright test --project=chromium
npx playwright test --grep '@smoke'
npx playwright test --ui
```

Keep the single quotes around tags. In PowerShell, a bare `@smoke` is read as a variable.

### Run against the version with planted bugs

```
npx playwright test --config=playwright.bugs.config.ts --grep-invert '@visual'
npx playwright show-report playwright-report-bugs
```

## Continuous integration

| When | What runs |
| --- | --- |
| Every push and pull request to `main` | Tests tagged `@smoke` |
| Every night at 02:00 Manila time, or on demand | The full suite, except screenshot comparisons |

The public site's Cloudflare bot check blocks automated browsers on GitHub's servers, so CI doesn't test it. Each job checks out the app's source code at a pinned version, starts it with Docker, and runs the tests against that copy. Two machines each run half of the tests, and their results are merged into one HTML report published to GitHub Pages.

## AI-assisted tests

The favorites tests were built with [Playwright Test Agents](https://playwright.dev/docs/test-agents) through Claude Code:

1. **Planner:** explored the favorites feature from [`tests/seed.spec.ts`](tests/seed.spec.ts) and wrote [`specs/favorites.md`](specs/favorites.md). I reviewed and edited the plan.
2. **Generator:** turned each scenario into a test, one at a time.
3. **Refactor:** I moved the generated inline locators into a `FavoritesPage` page object, to match the rest of the framework.
4. **Healer:** fixed failing tests. I reviewed each fix with `git diff` before accepting it.

## Tech stack

- [Playwright Test](https://playwright.dev/) with TypeScript
- [Faker](https://fakerjs.dev/) for test data
- [axe-core](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) for accessibility checks
- GitHub Actions, Docker and GitHub Pages
- Playwright Test Agents, run through Claude Code

## Test data and credentials

The tests use the site's public demo admin account, read from `.env`, and customers they register themselves. No real credentials are stored in this repository. Customer accounts lock after three wrong passwords, so tests that type wrong passwords only ever use customers they created.

## About

Practice Software Testing is a demo application by [Testsmith](https://github.com/testsmith-io/practice-software-testing). This project is not affiliated with Testsmith.
