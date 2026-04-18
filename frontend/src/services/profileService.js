const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ||
  'http://localhost:8089';

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
});

const readJson = async (response, fallbackMessage) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const payload = await response.json();
      throw new Error(payload.message || payload.error || fallbackMessage);
    }

    throw new Error((await response.text()) || fallbackMessage);
  }

  return response.json();
};

export const profileService = {
  getMyProfile: async (token) => {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders(token)
    });

    return readJson(response, 'Failed to load your profile');
  },

  updateMyProfile: async (token, payload) => {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });

    return readJson(response, 'Failed to update your profile');
  }
};
