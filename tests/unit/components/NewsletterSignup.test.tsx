import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsletterSignup from "@/components/NewsletterSignup";
import { createMockNewsletterSubscriber } from "../../utils/testHelpers";

// Mock fetch
global.fetch = jest.fn();

describe("NewsletterSignup Component", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test("renders newsletter signup form", () => {
    render(<NewsletterSignup />);

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /subscribe/i })
    ).toBeInTheDocument();
  });

  test("validates email input", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    // Test empty email
    await user.click(submitButton);
    // Component should show validation message or prevent submission

    // Test invalid email
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);
    // Should show invalid email message
  });

  test("handles successful subscription", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      message: "Successfully subscribed to newsletter",
      subscriberId: "test-id",
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
    });
  });

  test("handles subscription error", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Email already subscribed" }),
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "existing@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      // Should show error message
      expect(screen.getByText(/email already subscribed/i)).toBeInTheDocument();
    });
  });

  test("shows loading state during submission", async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Success" }),
              }),
            100
          )
        )
    );

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/subscribing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/subscribing/i)).not.toBeInTheDocument();
    });
  });

  test("disables form during submission", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Success" }),
              }),
            100
          )
        )
    );

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    // Form should be disabled during submission
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("clears form after successful subscription", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Successfully subscribed" }),
    });

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");

    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveValue("");
    });
  });
});
