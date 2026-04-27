import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatInterface from "./ChatInterface";
import { NotificationProvider } from "../context/NotificationContext";

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
};

vi.mock("socket.io-client", () => ({
  io: () => mockSocket,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("../../lib/api", () => ({
  getAuthToken: vi.fn().mockResolvedValue("fake-token"),
}));

describe("ChatInterface Component", () => {
  const mockUser = { id_utilisateur: 1, email: "me@test.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]), // Empty conversations
    });
  });

  it("should render chat title and placeholder when no active chat", async () => {
    render(
      <NotificationProvider user={mockUser}>
        <ChatInterface user={mockUser} isAdmin={false} />
      </NotificationProvider>
    );

    expect(screen.getByText(/chat.title/i)).toBeInTheDocument();
    expect(screen.getByText(/chat.secure_messaging/i)).toBeInTheDocument();
  });

  it("should emit join_conversation when a chat is selected", async () => {
    const mockConversations = [
      {
        id_conversation: 1,
        participants: [
          { id_utilisateur: 1, email: "me@test.com" },
          { id_utilisateur: 2, email: "partner@test.com", type_utilisateur: "ADMIN", Administrateur: { nom: "Admin", prenom: "Super" } }
        ],
        messages: []
      }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConversations),
    }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]), // Empty messages
    });

    render(
      <NotificationProvider user={mockUser}>
        <ChatInterface user={mockUser} isAdmin={false} />
      </NotificationProvider>
    );

    // Wait for conversation to appear and click it
    const conv = await screen.findByText("Super Admin");
    fireEvent.click(conv);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("join_conversation", 1);
    });
  });
});
