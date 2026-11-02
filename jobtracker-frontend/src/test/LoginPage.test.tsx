import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "../features/auth/pages/LoginPage";
import { login, saveAuth } from "../features/auth/api/auth";

vi.mock("../features/auth/api/auth", async () => {
  const actual = await vi.importActual<typeof import("../features/auth/api/auth")>("../features/auth/api/auth");
  return {
    ...actual,
    login: vi.fn(),
    saveAuth: vi.fn(),
    loginWithGoogle: vi.fn(),
  };
});

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Login</div>,
}));

describe("LoginPage", () => {
  it("submits credentials and navigates to the dashboard", async () => {
    vi.mocked(login).mockResolvedValue({
      token: "token-1",
      userId: 7,
      email: "user@example.com",
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard View</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("user@example.com", "secret123");
      expect(saveAuth).toHaveBeenCalled();
      expect(screen.getByText("Dashboard View")).toBeInTheDocument();
    });
  });
});
