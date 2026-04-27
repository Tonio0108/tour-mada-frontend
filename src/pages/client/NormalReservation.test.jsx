import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NormalReservation from "./NormalReservation";
import { MemoryRouter } from "react-router";
import * as api from "../../../lib/api";
import { useAuth } from "../../hooks/useAuth";

// Mock variables
const mockNavigate = vi.fn();

// Mocks
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
  Trans: ({ children }) => children,
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", () => ({
  reservationAPI: {
    createReservation: vi.fn(),
  },
  Tours: {
    getTourStandardsById: vi.fn(),
    createTourPersonnalise: vi.fn(),
  },
  MailApi: {
    notifyReservation: vi.fn(),
    notifyCustomTour: vi.fn(),
  },
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
    useParams: () => ({ id: "10" }),
  };
});

describe("NormalReservation Page", () => {
  const mockUser = {
    email: "john@doe.com",
    Clients: {
      id_client: 1,
      nom: "Doe",
      prenom: "John",
      telephone: "12345678",
      adresse: "123 Street",
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    vi.mocked(api.Tours.getTourStandardsById).mockResolvedValue({
      id_tour: 10,
      nom_tour: "Safari",
      prix_par_pers: 500,
      duree_jours: 3
    });
  });

  it("should calculate total people automatically", async () => {
    render(
      <MemoryRouter>
        <NormalReservation />
      </MemoryRouter>
    );

    const adultInput = screen.getByLabelText(/reservation.people_distribution.adults/i);
    const youthInput = screen.getByLabelText(/reservation.people_distribution.youth/i);
    const totalInput = screen.getByLabelText(/reservation.reservation_details.total_people/i);

    fireEvent.change(adultInput, { target: { value: "2" } });
    fireEvent.change(youthInput, { target: { value: "1" } });

    await waitFor(() => {
      expect(totalInput).toHaveValue(3);
    });
  });

  it("should successfully submit the reservation", async () => {
    vi.mocked(api.reservationAPI.createReservation).mockResolvedValue({ id_reservation: 100 });

    render(
      <MemoryRouter>
        <NormalReservation />
      </MemoryRouter>
    );

    // Ensure tour data is loaded and pre-filled
    await waitFor(() => {
      expect(screen.getByLabelText(/reservation.personal_info.full_name/i)).toHaveValue("Doe John");
    });

    // Mandatory fields
    fireEvent.change(screen.getByLabelText(/reservation.reservation_details.planned_date/i), { target: { value: "2026-05-20" } });
    fireEvent.change(screen.getByLabelText(/reservation.reservation_details.days_count/i), { target: { value: "3" } });
    
    // Distribution (must sum to 1 by default, or we update it)
    // Let's set 1 adult, 1 man, 0 women
    fireEvent.change(screen.getByLabelText(/reservation.people_distribution.adults/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/reservation.people_distribution.men/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/reservation.people_distribution.women/i), { target: { value: "0" } });
    
    // Ages
    fireEvent.change(screen.getByLabelText(/reservation.people_distribution.oldest_age/i), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText(/reservation.people_distribution.youngest_age/i), { target: { value: "40" } });

    // Amounts
    fireEvent.change(screen.getByLabelText(/reservation.budget.total_amount/i), { target: { value: "500" } });
    fireEvent.change(screen.getByLabelText(/reservation.budget.estimated_budget/i), { target: { value: "500" } });

    // Final check before submit
    expect(screen.getByLabelText(/reservation.reservation_details.total_people/i)).toHaveValue(1);

    const submitBtn = screen.getByRole("button", { name: /reservation.submit_button.confirm/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.reservationAPI.createReservation).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/client/reservations");
    }, { timeout: 3000 });
  });
});
