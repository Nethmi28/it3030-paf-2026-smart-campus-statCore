const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

const getHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
});

export const bookingService = {
    // Create new booking
    createBooking: async (token, bookingData, file = null) => {
        let options;
        
        if (file) {
            const formData = new FormData();
            formData.append('booking', new Blob([JSON.stringify(bookingData)], { type: 'application/json' }));
            formData.append('file', file);
            
            options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type, fetch will automatically set it to multipart/form-data with boundaries
                },
                body: formData
            };
        } else {
            // No file attached
            const formData = new FormData();
            formData.append('booking', new Blob([JSON.stringify(bookingData)], { type: 'application/json' }));
            
            options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            };
        }

        const response = await fetch(`${API_BASE}/api/bookings`, options);
        
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(errBody || 'Failed to create booking');
        }
        return response.json();
    },

    // Get available spots dynamically
    getAvailability: async (token, resourceId, date) => {
        const response = await fetch(`${API_BASE}/api/bookings/availability?resourceId=${resourceId}&date=${date}`, {
            headers: getHeaders(token)
        });
        if (!response.ok) throw new Error('Failed to fetch availability');
        return response.json();
    },

    // Get current user's bookings
    getMyBookings: async (token) => {
        const response = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
            headers: getHeaders(token)
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
    },

    // Get all bookings (Admin)
    getAllBookings: async (token) => {
        const response = await fetch(`${API_BASE}/api/bookings`, {
            headers: getHeaders(token)
        });
        if (!response.ok) throw new Error('Failed to fetch all bookings');
        return response.json();
    },

    // Update booking status (Admin)
    updateStatus: async (token, bookingId, statusData) => {
        const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(statusData)
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    },

    // Cancel booking (User)
    cancelBooking: async (token, bookingId) => {
        const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: getHeaders(token)
        });
        if (!response.ok) throw new Error('Failed to cancel booking');
        return response.json();
    }
};
