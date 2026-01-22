import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage";
import VerifyEmailPage from "../VerifyEmailPage";

jest.mock("../../../components/auth/AuthLayout", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("../../../lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(async () => ({ error: null })),
      resend: jest.fn(async () => ({ error: null })),
      getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

jest.mock("../../../lib/utils/hybridAuth", () => ({
  signInWithEmail: jest.fn(async () => {
    const error: any = new Error("Email not confirmed");
    error.code = "EMAIL_NOT_CONFIRMED";
    throw error;
  }),
}));

describe("Authentication redirect behavior", () => {

  test("VerifyEmailPage guards access without source and email", async () => {
    render(
      <MemoryRouter initialEntries={["/verify-email?email=test@example.com"]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<div data-testid="login" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("login")).toBeInTheDocument();
    });
  });

  test("VerifyEmailPage allows access with valid source", async () => {
    render(
      <MemoryRouter initialEntries={["/verify-email?email=test@example.com&source=manual"]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: /Resend Verification Email/i }
    )).toBeInTheDocument();
  });
});
