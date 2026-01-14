// frontend/_tests_/api.test.js
import { authApi } from '../lib/api';

describe('API Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('login API call', async () => {
    const mockResponse = { ok: true, token: 'test-token' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});