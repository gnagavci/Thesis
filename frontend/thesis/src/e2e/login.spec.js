import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for all tests
    await page.route("**/api/auth/login", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (
        postData.username === "testuser" &&
        postData.password === "testpass"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            token: "mock-jwt-token-12345",
            user: {
              id: 1,
              username: "testuser",
              email: "test@example.com",
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Invalid credentials" }),
        });
      }
    });

    // Mock simulations API
    await page.route("**/api/simulations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          simulations: [
            {
              id: 1,
              title: "Cancer Cell Growth",
              mode: "3D",
              substrate: "Oxygen",
              duration: 30,
              status: "Done",
              tumorCount: 500,
              immuneCount: 200,
              createdAt: "2024-01-15T10:00:00Z",
            },
            {
              id: 2,
              title: "Immune Response Model",
              mode: "2D",
              substrate: "Glucose",
              duration: 45,
              status: "Running",
              tumorCount: 300,
              immuneCount: 150,
              createdAt: "2024-01-15T11:00:00Z",
            },
          ],
        }),
      });
    });
  });

  test("should complete full login flow and navigate to dashboard", async ({
    page,
  }) => {
    // Navigate to the app
    await page.goto("/");

    // Verify we're on the login page
    await expect(page.locator('input[placeholder="USERNAME"]')).toBeVisible();
    await expect(page.locator('input[placeholder="PASSWORD"]')).toBeVisible();

    // Fill login form
    await page.fill('input[placeholder="USERNAME"]', "testuser");
    await page.fill('input[placeholder="PASSWORD"]', "testpass");

    // Submit login form
    await page.click('button:has-text("LOGIN")');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/.*simulations/);

    // Verify dashboard content is loaded
    await expect(page.locator('h1:has-text("My Simulations")')).toBeVisible();
    await expect(page.locator("text=Cancer Cell Growth")).toBeVisible();
    await expect(page.locator("text=Immune Response Model")).toBeVisible();

    // Verify status indicators
    await expect(page.locator("text=Done")).toBeVisible();
    await expect(page.locator("text=Running")).toBeVisible();
  });

  test("should handle invalid login credentials", async ({ page }) => {
    await page.goto("/");

    // Try invalid credentials
    await page.fill('input[placeholder="USERNAME"]', "wronguser");
    await page.fill('input[placeholder="PASSWORD"]', "wrongpass");
    await page.click('button:has-text("LOGIN")');

    // Should show error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL("/");
  });

  test("should show loading state during login", async ({ page }) => {
    await page.goto("/");

    await page.fill('input[placeholder="USERNAME"]', "testuser");
    await page.fill('input[placeholder="PASSWORD"]', "testpass");

    // Click login and immediately check for loading state
    await page.click('button:has-text("LOGIN")');

    // Login button should show loading text
    await expect(page.locator('button:has-text("LOGGING IN")')).toBeVisible();
  });

  test("should navigate between dashboard and create simulation", async ({
    page,
  }) => {
    // Login first
    await page.goto("/");
    await page.fill('input[placeholder="USERNAME"]', "testuser");
    await page.fill('input[placeholder="PASSWORD"]', "testpass");
    await page.click('button:has-text("LOGIN")');

    // Wait for dashboard
    await expect(page.locator('h1:has-text("My Simulations")')).toBeVisible();

    // Click "Create New Simulation" link
    await page.click('a:has-text("Create New Simulation")');

    // Should navigate to create simulation page
    await expect(page).toHaveURL(/.*new/);
    await expect(
      page.locator('h1:has-text("Create New Simulation")')
    ).toBeVisible();

    // Should see form elements
    await expect(
      page.locator('label:has-text("Select Template")')
    ).toBeVisible();
    await expect(page.locator('input[name="title"]')).toBeVisible();
  });
});
