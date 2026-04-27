import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
import { MemoryRouter } from "react-router";
import * as api from "@/lib/api";
import { useAuth } from "@src/hooks/useAuth";

// Define mock variables with 'mock' prefix so Vitest allows them in hoisted vi.mock
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

// Mocks
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
  Trans: ({ children }) => children,
}));

vi.mock("@src/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("@/lib/api", () => ({
  authAPI: {
    login: vi.fn(),
  },
  setAuthToken: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/login.email_label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login.password_label/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login.submit_button/i })).toBeInTheDocument();
  });

  it("should successfully login and redirect user", async () => {
    const mockResponse = { token: "fake-jwt-token" };
    const mockUserProfile = { type_utilisateur: "CLIENT" };
    
    vi.mocked(api.authAPI.login).mockResolvedValue(mockResponse);
    mockLogin.mockResolvedValue(mockUserProfile);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/login.email_label/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/login.password_label/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: /login.submit_button/i }));

    await waitFor(() => {
      expect(api.authAPI.login).toHaveBeenCalledWith({
        email: "test@test.com",
        mot_de_passe: "password123",
      });
      expect(api.setAuthToken).toHaveBeenCalledWith("fake-jwt-token");
      expect(mockLogin).toHaveBeenCalledWith("fake-jwt-token");
      expect(mockNavigate).toHaveBeenCalledWith("/client", { replace: true });
    });
  });
});
