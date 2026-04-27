import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "./useAuth";
import * as api from "../../lib/api";

// Mock des fonctions API
vi.mock("../../lib/api", () => ({
  getAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
  API_BASE_URL: "http://localhost:3000/api",
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // On simule un fetch global
    global.fetch = vi.fn();
  });

  it("should initialize with default state", async () => {
    vi.mocked(api.getAuthToken).mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it("should authenticate if token is found", async () => {
    const mockUser = { id_utilisateur: 1, email: "test@test.com", type_utilisateur: "CLIENT" };
    vi.mocked(api.getAuthToken).mockReturnValue("fake-token");
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useAuth());

    // On attend la fin du chargement
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("should logout correctly", async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(api.removeAuthToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});
