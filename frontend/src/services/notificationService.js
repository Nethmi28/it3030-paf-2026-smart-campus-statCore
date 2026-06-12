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

export const notificationService = {
  getMyNotifications: async (token) => {
    const response = await fetch(`${API_BASE}/api/notifications`, {
      headers: getHeaders(token)
    });
    return readJson(response, 'Failed to fetch notifications');
  },

  getUnreadCount: async (token) => {
    const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
      headers: getHeaders(token)
    });
    return readJson(response, 'Failed to fetch unread count');
  },

  markAsRead: async (token, notificationId) => {
    const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getHeaders(token)
    });
    return readJson(response, 'Failed to mark the notification as read');
  },

  markAllAsRead: async (token) => {
    const response = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: getHeaders(token)
    });
    return readJson(response, 'Failed to mark all notifications as read');
  }
};
