# Favorites Feature Test Plan

## Application Overview

Covers the Favorites feature of Practice Software Testing - Toolshop (https://practicesoftwaretesting.com): adding a product from its detail page, viewing it under My account > Favorites (/account/favorites), and removing it. Verified against the live site on 2026-10-31. Locators (testIdAttribute = data-test): add-to-favorites (button "Add to favourites", id btn-add-to-favorites), nav-menu, nav-my-favorites, nav-sign-out, delete (red icon-only button on each favorite card), product-name, page-title; toasts are role=alert elements. IMPORTANT: demo account customer@practicesoftwaretesting.com / welcome01 (Jane Doe) is SHARED and already holds favorites (Combination Pliers, Slip Joint Pliers, Belt Sander), so it is not a blank state. Every scenario assumes a freshly registered customer (e.g. POST https://api.practicesoftwaretesting.com/users/register with a unique email like fav.<timestamp>@example.com, then log in via UI) with zero favorites. The demo login page does not actually list credentials in its UI. Product used in examples: "Pliers" (/product/01M68SW7QKSJ44Q2KGZCZH6V79); second product "Slip Joint Pliers" (/product/01M68SW7R0R466VMCXZX16JJ87).

## Test Scenarios

### 1. Add to favorites

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a product to favorites from its detail page (happy path)

**File:** `tests/favorites/add-favorite.spec.ts`

**Steps:**
  1. Log in as a fresh customer and navigate to /product/01M68SW7QKSJ44Q2KGZCZH6V79 (Pliers).
    - expect: Product detail page shows an 'Add to favourites' button next to 'Add to cart' and 'Compare'.
  2. Click 'Add to favourites'.
    - expect: A toast 'Product added to your favorites list.' appears.
    - expect: User stays on the product page.
    - expect: Button label and enabled state remain 'Add to favourites' (no toggled/filled state).

#### 1.2. Add several different products

**File:** `tests/favorites/add-multiple.spec.ts`

**Steps:**
  1. As a fresh customer, add Pliers, then open Slip Joint Pliers and add it too.
    - expect: Each add shows 'Product added to your favorites list.'
  2. Open My account > Favorites.
    - expect: Both products are listed, each as its own card.

#### 1.3. Adding the same product twice shows 'already' message and no duplicate

**File:** `tests/favorites/add-duplicate.spec.ts`

**Steps:**
  1. As a fresh customer, open Pliers and click 'Add to favourites' twice.
    - expect: First click: 'Product added to your favorites list.'
    - expect: Second click: toast 'Product already in your favorites list.' (a console error from the rejected API call is observed and acceptable).
    - expect: Button stays enabled.
  2. Open /account/favorites.
    - expect: Pliers appears exactly once.

#### 1.4. Adding to favorites while logged out is rejected

**File:** `tests/favorites/add-logged-out.spec.ts`

**Steps:**
  1. With no session (cleared cookies/localStorage), open the Pliers product page and click 'Add to favourites'.
    - expect: Toast 'Unauthorized, can not add product to your favorite list.' appears.
    - expect: No redirect: URL remains the product page.
    - expect: Nothing is added to any account.
  2. Navigate directly to /account/favorites while logged out.
    - expect: User is redirected to /auth/login.

#### 1.5. Favorite persists across logout/login and reload

**File:** `tests/favorites/persistence.spec.ts`

**Steps:**
  1. Add Pliers as a fresh customer, sign out via the user menu (Sign out), log in again with the same account, open /account/favorites.
    - expect: Pliers is still listed (stored server-side).

### 2. View favorites

**Seed:** `tests/seed.spec.ts`

#### 2.1. Favorited product appears under My account > Favorites via menu

**File:** `tests/favorites/view-favorites.spec.ts`

**Steps:**
  1. After adding Pliers, click the user name in the navbar (nav-menu).
    - expect: Dropdown shows: My account, My favorites, My profile, My invoices, My messages, Sign out.
  2. Click 'My favorites'.
    - expect: URL is /account/favorites; page title 'Favorites'; heading 'Favorites'.
    - expect: A card shows the product image, name 'Pliers' (heading) and a truncated description ending in '...'.
    - expect: Each card has an icon-only red delete button.

#### 2.2. Empty favorites state for a new user

**File:** `tests/favorites/empty-state.spec.ts`

**Steps:**
  1. Register and log in as a new customer; open /account/favorites.
    - expect: Heading 'Favorites' is shown with the text 'There are no favorites yet. In order to add favorites, please go to the product listing and mark some products as your favorite.'
    - expect: No product cards and no delete buttons.

#### 2.3. Favorites are per user

**File:** `tests/favorites/isolation.spec.ts`

**Steps:**
  1. User A adds Pliers. Sign out and log in as new user B; open /account/favorites.
    - expect: User B sees the empty-state message; Pliers is not shown.

### 3. Remove favorites

**Seed:** `tests/seed.spec.ts`

#### 3.1. Remove one of several favorites

**File:** `tests/favorites/remove-favorite.spec.ts`

**Steps:**
  1. Fresh customer adds Pliers and Slip Joint Pliers; open /account/favorites.
    - expect: Two cards visible.
  2. Click the delete button on the Pliers card.
    - expect: The Pliers card disappears (allow a moment for the list to refresh).
    - expect: Slip Joint Pliers remains.
    - expect: Note: no confirmation dialog appeared; a removal toast was not reliably observed - verify and document actual behavior.
  3. Reload the page.
    - expect: Only Slip Joint Pliers is listed (removal persisted).

#### 3.2. Remove the last favorite returns the empty state

**File:** `tests/favorites/remove-last.spec.ts`

**Steps:**
  1. Fresh customer adds only Pliers; open /account/favorites and click delete.
    - expect: Card disappears and the message 'There are no favorites yet. In order to add favorites, please go to the product listing and mark some products as your favorite.' is shown.
  2. Reload the page.
    - expect: Empty-state message still shown.

#### 3.3. Re-add a product after removing it

**File:** `tests/favorites/readd-after-remove.spec.ts`

**Steps:**
  1. Add Pliers, remove it from /account/favorites, return to the Pliers product page and click 'Add to favourites'.
    - expect: Toast 'Product added to your favorites list.' (not the 'already' message).
    - expect: Pliers appears again in /account/favorites.

#### 3.4. Removed product can still be favorited from another tab / stale page

**File:** `tests/favorites/stale-state.spec.ts`

**Steps:**
  1. In tab 1 open the Pliers detail page. In tab 2 add Pliers and then remove it from favorites. In tab 1 click 'Add to favourites'.
    - expect: Tab 1 shows 'Product added to your favorites list.' since the button has no stored state.
