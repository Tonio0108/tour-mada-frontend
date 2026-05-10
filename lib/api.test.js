import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authAPI, API_BASE_URL } from './api';

describe('authAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('login should call fetch with correct parameters', async () => {
    const mockResponse = { token: 'fake-token', user: { email: 'test@test.com' } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const credentials = { email: 'test@test.com', mot_de_passe: 'password' };
    const result = await authAPI.login(credentials);

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    expect(result).toEqual(mockResponse);
  });

  it('login should throw error if response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    });

    const credentials = { email: 'test@test.com', mot_de_passe: 'wrong' };
    await expect(authAPI.login(credentials)).rejects.toThrow('Invalid credentials');
  });

  it('register should call fetch with correct parameters', async () => {
    const mockResponse = { message: 'Success' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const userData = { email: 'new@test.com', mot_de_passe: 'pass' };
    const result = await authAPI.register(userData);

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    expect(result).toEqual(mockResponse);
  });
});
