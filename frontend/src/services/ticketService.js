import axios from 'axios';

// Ensure you match backend port
const API_URL = 'http://localhost:8089/api/tickets';

const createTicket = async (ticketData, files) => {
    // We send data via multipart/form-data
    const formData = new FormData();
    
    // Convert object to blob for spring boot RequestPart "ticket"
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], {
        type: 'application/json'
    }));

    if (files && files.length > 0) {
        // Must match backend parameter name "files"
        files.forEach((file) => {
            formData.append('files', file);
        });
    }

    // Pass the standard auth token. Adjust getting token depending on the App setup.
    const token = localStorage.getItem('token'); 
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            // Axios automatically sets Content-Type to multipart/form-data with boundaries
        }
    };

    const response = await axios.post(API_URL, formData, config);
    return response.data;
};

const getMyTickets = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/my`, config);
    return response.data;
};

const getTicketComments = async (ticketId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${ticketId}/comments`, config);
    return response.data;
};

const addComment = async (ticketId, content) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.post(`${API_URL}/${ticketId}/comments`, { content }, config);
    return response.data;
};

export const ticketService = {
    createTicket,
    getMyTickets,
    getTicketComments,
    addComment
};
