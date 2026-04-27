import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "./Register";
import { MemoryRouter } from "react-router";
import * as api from "@/lib/api";

// Mock variables with 'mock' prefix
const mockNavigate = vi.fn();

// Mocks
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
  Trans: ({ children }) => children,
}));

vi.mock("@/lib/api", () => ({
  authAPI: {
    register: vi.fn(),
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
  };
});

describe("Register Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all registration sections", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText(/register.sections.personal/i)).toBeInTheDocument();
    expect(screen.getByText(/register.sections.address/i)).toBeInTheDocument();
    expect(screen.getByText(/register.sections.security/i)).toBeInTheDocument();
  });

  it("should successfully register a new user", async () => {
    const mockResponse = { token: "new-jwt-token" };
    vi.mocked(api.authAPI.register).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill personal info
    fireEvent.change(screen.getByLabelText(/register.personal_info.first_name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/register.personal_info.last_name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/register.personal_info.email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/register.personal_info.phone/i), { target: { value: "12345678" } });

    // Fill address
    fireEvent.change(screen.getByLabelText(/register.personal_info.address/i), { target: { value: "Main St" } });
    fireEvent.change(screen.getByLabelText(/register.personal_info.city/i), { target: { value: "Antananarivo" } });
    fireEvent.change(screen.getByLabelText(/register.personal_info.postal_code/i), { target: { value: "101" } });

    // Fill security
    fireEvent.change(screen.getByLabelText(/register.password.password/i), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/register.password.confirm_password/i), { target: { value: "Password123!" } });

    // Accept terms
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /register.submit_button.create_account/i }));

    await waitFor(() => {
      expect(api.authAPI.register).toHaveBeenCalled();
      expect(api.setAuthToken).toHaveBeenCalledWith("new-jwt-token");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
