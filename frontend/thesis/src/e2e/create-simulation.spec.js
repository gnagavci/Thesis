import { test, expect } from "@playwright/test";

test.describe("Create Simulation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock login API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mock-jwt-token-12345",
          user: { id: 1, username: "testuser" },
        }),
      });
    });

    // Mock create simulation API
    await page.route("**/api/simulations/create-batch", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          created: postData.count || 1,
          simulations: [
            {
              id: 100,
              title: postData.simulationData.title,
              status: "Submitted",
            },
          ],
        }),
      });
    });

    // Login before each test
    await page.goto("/");
    await page.fill('input[placeholder="USERNAME"]', "testuser");
    await page.fill('input[placeholder="PASSWORD"]', "testpass");
    await page.click('button:has-text("LOGIN")');

    // Navigate to create simulation page
    await page.click('a:has-text("Create New Simulation")');
    await expect(
      page.locator('h1:has-text("Create New Simulation")')
    ).toBeVisible();
  });

  test("should create a basic simulation", async ({ page }) => {
    // Verify default template is selected
    await expect(page.locator('select[id="template"]')).toHaveValue("basic");

    // Check default values are populated
    await expect(page.locator('input[name="title"]')).toHaveValue(
      "Basic Simulation"
    );
    await expect(page.locator('input[name="duration"]')).toHaveValue("5");

    // Modify the simulation title
    await page.fill('input[name="title"]', "My Test Simulation");

    // Submit the form
    await page.click('button:has-text("Create 1 Simulation")');

    // Should show success message
    await expect(
      page.locator("text=Successfully created and queued 1 simulation")
    ).toBeVisible();

    // Should redirect to dashboard after a delay
    await expect(page).toHaveURL(/.*simulations/, { timeout: 10000 });
  });

  test("should change templates and update fields", async ({ page }) => {
    // Change to advanced template
    await page.selectOption('select[id="template"]', "advanced");

    // Check that fields updated
    await expect(page.locator('input[name="title"]')).toHaveValue(
      "Advanced Simulation"
    );
    await expect(page.locator('input[name="duration"]')).toHaveValue("30");

    // Change to performance template
    await page.selectOption('select[id="template"]', "performance");

    // Check that fields updated again
    await expect(page.locator('input[name="title"]')).toHaveValue(
      "Performance Test"
    );
    await expect(page.locator('input[name="duration"]')).toHaveValue("60");
  });

  test("should handle custom template field selection", async ({ page }) => {
    // Change to custom template
    await page.selectOption('select[id="template"]', "custom");

    // Should show custom field selector
    await expect(
      page.locator("text=Select Fields for Your Custom Simulation")
    ).toBeVisible();

    // Should show field categories
    await expect(page.locator("text=Basic Information")).toBeVisible();
    await expect(page.locator("text=Cell Types")).toBeVisible();

    // Required fields should be checked and disabled
    const tumorCountCheckbox = page
      .locator('input[type="checkbox"]')
      .filter({ hasText: "Tumor Count" });
    await expect(tumorCountCheckbox).toBeChecked();
    await expect(tumorCountCheckbox).toBeDisabled();
  });

  test("should create batch simulations", async ({ page }) => {
    // Change batch count
    await page.fill('input[id="numberOfSimulations"]', "5");

    // Button text should update
    await expect(
      page.locator('button:has-text("Create 5 Simulations")')
    ).toBeVisible();

    // Submit form
    await page.click('button:has-text("Create 5 Simulations")');

    // Should show success message for multiple simulations
    await expect(
      page.locator("text=Successfully created and queued 5 simulation")
    ).toBeVisible();
  });

  test("should validate form inputs", async ({ page }) => {
    // Clear required field
    await page.fill('input[name="title"]', "");

    // Try to submit
    await page.click('button:has-text("Create 1 Simulation")');

    // HTML5 validation should prevent submission
    // The form should not submit (we can check if we're still on the same page)
    await expect(
      page.locator('h1:has-text("Create New Simulation")')
    ).toBeVisible();
  });

  test("should navigate back to dashboard via cancel", async ({ page }) => {
    // Click cancel link
    await page.click('a:has-text("Cancel")');

    // Should navigate back to dashboard
    await expect(page).toHaveURL(/.*simulations/);
    await expect(page.locator('h1:has-text("My Simulations")')).toBeVisible();
  });
});
