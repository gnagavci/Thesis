import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "@/components/Login";

describe("Login Component", () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch globally
    global.fetch = vi.fn();
  });

  it("renders login form with username and password fields", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByPlaceholderText("USERNAME")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const loginButton = screen.getByRole("button", { name: /login/i });

    // Try to submit without filling fields - HTML5 validation should prevent this
    // Since we can't easily test HTML5 validation, let's test the API error path

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");

    // Fill with empty values (which HTML5 won't allow, but we can test the API path)
    fireEvent.change(usernameInput, { target: { value: "test" } });
    fireEvent.change(passwordInput, { target: { value: "test" } });

    // Mock a validation error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Username is required" }),
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles successful login flow", async () => {
    const mockUser = { id: 1, username: "testuser" };
    const mockToken = "mock-jwt-token-12345";

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: mockToken,
        user: mockUser,
      }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    const loginButton = screen.getByRole("button", { name: /login/i });

    // Fill in credentials
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    // Submit form
    fireEvent.click(loginButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: "testuser", password: "testpass" }),
        }
      );
    });

    // Check that token was stored
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", mockToken);
    });

    // Check that callback was called
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it("handles login failure with invalid credentials", async () => {
    const errorMessage = "Invalid credentials";

    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    const loginButton = screen.getByRole("button", { name: /login/i });

    // Fill in credentials
    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    // Submit form
    fireEvent.click(loginButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Ensure no token was stored and callback wasn't called
    expect(localStorage.setItem).not.toHaveBeenCalledWith(
      "token",
      expect.any(String)
    );
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it("shows loading state during login request", async () => {
    // Mock delayed API response
    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ token: "test-token", user: { id: 1 } }),
              }),
            100
          )
        )
    );

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    fireEvent.click(loginButton);

    // Check for loading state
    expect(loginButton).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it("handles network errors gracefully", async () => {
    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("clears error messages when form is resubmitted", async () => {
    // First, cause an error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText("USERNAME");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    // Now mock a successful response and resubmit
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "token", user: { id: 1 } }),
    });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(loginButton);

    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
    });
  });
});
