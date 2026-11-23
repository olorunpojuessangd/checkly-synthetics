import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.automationexercise.com/');
	const consentButton = page.getByRole('button', { name: 'Consent' });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  } else {
    console.log('GDPR does not apply.');
  } 
  await page.getByRole('link', { name: ' Products' }).click();
  const searchBar = page.getByPlaceholder('Search Product');
  await expect(searchBar).toBeVisible();
  const addBlueTopButton = page.locator('div.productinfo a[data-product-id="1"]')
  await addBlueTopButton.click()
  const modalHeading = page.getByRole("heading", { name: "Added!"});
  await expect(modalHeading).toBeVisible();
  await page.getByRole('button', { name: 'Continue Shopping' }).click();
  await page.getByRole('link', { name: 'Cart'}).click();
  await page.getByText('Proceed To Checkout').click();
  await page.getByRole('link', { name: 'Register / Login' }).click();
  const signupHeading = page.getByRole('heading', { name: 'New User Signup!'});
  await expect(signupHeading).toBeVisible();
});