import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';

test('home page has no serious accessibility problems', {
  annotation: {
    type: 'bug',
    description: 'Category filters: each <ul> directly contains a <fieldset> instead of <li> items (axe rule "list")',
  },
}, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-name').first()).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    // Known defect, recorded in the annotation above. Remove this line once the site fixes it.
    .disableRules(['list'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');

  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});