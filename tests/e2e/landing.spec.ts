import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays main hero section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /transform your writing/i })
    ).toBeVisible();
    await expect(page.getByText(/ai-powered text humanizer/i)).toBeVisible();
  });

  test("shows WordWeave logo", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: /wordweave logo/i })
    ).toBeVisible();
  });

  test("displays navigation menu", async ({ page }) => {
    await expect(page.getByRole("link", { name: /blog/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /how it works/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test("newsletter signup works", async ({ page }) => {
    const newsletterInput = page.getByPlaceholderText(/enter your email/i);
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });

    await newsletterInput.fill("test@example.com");
    await subscribeButton.click();

    // Should show success message
    await expect(page.getByText(/successfully subscribed/i)).toBeVisible();
  });

  test("newsletter validates email format", async ({ page }) => {
    const newsletterInput = page.getByPlaceholderText(/enter your email/i);
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });

    await newsletterInput.fill("invalid-email");
    await subscribeButton.click();

    // Should show validation error
    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });

  test("displays pricing information", async ({ page }) => {
    await expect(page.getByText(/7-day free trial/i)).toBeVisible();
    await expect(page.getByText(/monthly/i)).toBeVisible();
    await expect(page.getByText(/yearly/i)).toBeVisible();
  });

  test("plan toggle works", async ({ page }) => {
    const monthlyButton = page.getByRole("button", { name: /monthly/i });
    const yearlyButton = page.getByRole("button", { name: /yearly/i });

    // Default should be monthly
    await expect(monthlyButton).toHaveClass(/selected|active/);

    // Switch to yearly
    await yearlyButton.click();
    await expect(yearlyButton).toHaveClass(/selected|active/);

    // Switch back to monthly
    await monthlyButton.click();
    await expect(monthlyButton).toHaveClass(/selected|active/);
  });

  test("footer contains essential links", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /privacy policy/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /terms of service/i })
    ).toBeVisible();
  });

  test("responsive design on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

    // Should show mobile menu toggle
    const mobileMenuButton = page.getByRole("button", { name: /menu/i });
    await expect(mobileMenuButton).toBeVisible();

    // Click to open mobile menu
    await mobileMenuButton.click();
    await expect(page.getByRole("link", { name: /blog/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /how it works/i })
    ).toBeVisible();
  });

  test("CTA buttons are functional", async ({ page }) => {
    const startTrialButton = page
      .getByRole("button", { name: /start.*free trial/i })
      .first();
    await expect(startTrialButton).toBeVisible();
    await expect(startTrialButton).toBeEnabled();
  });
});

test.describe("Blog Navigation", () => {
  test("can navigate to blog from landing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /blog/i }).click();

    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { name: /blog/i })).toBeVisible();
  });

  test("blog page displays articles", async ({ page }) => {
    await page.goto("/blog");

    // Should show blog articles
    await expect(page.getByText(/ai humanizer/i)).toBeVisible();
    await expect(page.getByText(/bypass.*detection/i)).toBeVisible();
  });

  test("can read individual blog articles", async ({ page }) => {
    await page.goto("/blog");

    // Click on first article
    const firstArticleLink = page.getByRole("link").first();
    await firstArticleLink.click();

    // Should navigate to article page
    expect(page.url()).toContain("/blog/");
    await expect(page.getByRole("article")).toBeVisible();
  });
});

test.describe("How It Works Page", () => {
  test("displays how it works content", async ({ page }) => {
    await page.goto("/how-it-works");

    await expect(
      page.getByRole("heading", { name: /how.*works/i })
    ).toBeVisible();
    await expect(page.getByText(/step/i)).toBeVisible();
  });
});

test.describe("Authentication Flow", () => {
  test("can navigate to sign in page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();

    await expect(page).toHaveURL("/auth/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("sign in form is functional", async ({ page }) => {
    await page.goto("/auth/signin");

    const emailInput = page.getByPlaceholderText(/email/i);
    const passwordInput = page.getByPlaceholderText(/password/i);
    const signInButton = page.getByRole("button", { name: /sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();

    // Test form validation
    await signInButton.click();
    // Should show validation errors for empty fields
  });

  test("can navigate to sign up page", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.getByRole("link", { name: /sign up/i }).click();

    await expect(page).toHaveURL("/auth/signup");
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
  });

  test("can navigate to forgot password", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.getByRole("link", { name: /forgot.*password/i }).click();

    await expect(page).toHaveURL("/auth/forgot-password");
    await expect(
      page.getByRole("heading", { name: /forgot.*password/i })
    ).toBeVisible();
  });
});

test.describe("SEO and Performance", () => {
  test("has proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/wordweave/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /ai.*humanizer/i);
  });

  test("loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have one h1
    const h1Elements = page.locator("h1");
    await expect(h1Elements).toHaveCount(1);

    // Should have h2 elements
    const h2Elements = page.locator("h2");
    await expect(h2Elements).toHaveCount.toBeGreaterThan(0);
  });
});

test.describe("Accessibility", () => {
  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/");

    // Tab through focusable elements
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("has proper alt text for images", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("has proper ARIA labels", async ({ page }) => {
    await page.goto("/");

    // Logo should have aria-label
    const logo = page.getByRole("img", { name: /wordweave logo/i });
    await expect(logo).toHaveAttribute("aria-label", /wordweave logo/i);
  });
});
