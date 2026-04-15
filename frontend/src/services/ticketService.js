import axios from 'axios';

const API_URL = 'http://localhost:8089/api/tickets';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
};

const createTicket = async (ticketData, files) => {
    const formData = new FormData();
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], {
        type: 'application/json'
    }));

    if (files && files.length > 0) {
        files.forEach((file) => {
            formData.append('files', file);
        });
    }

    const response = await axios.post(API_URL, formData, getAuthConfig());
    return response.data;
};

const getMyTickets = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthConfig());
    return response.data;
};

const getTicketById = async (ticketId) => {
    const response = await axios.get(`${API_URL}/${ticketId}`, getAuthConfig());
    return response.data;
};

const getAssignedToMe = async () => {
    const response = await axios.get(`${API_URL}/assigned-to-me`, getAuthConfig());
    return response.data;
};

const getAllTickets = async (status, priority, category) => {
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (category) params.category = category;
    const response = await axios.get(`${API_URL}/all`, { ...getAuthConfig(), params });
    return response.data;
};

const assignTicket = async (ticketId, technicianId) => {
    const response = await axios.patch(`${API_URL}/${ticketId}/assign`, { technicianId }, getAuthConfig());
    return response.data;
};

const updateTicketStatus = async (ticketId, status, resolutionNotes) => {
    const response = await axios.patch(`${API_URL}/${ticketId}/status`, { status, resolutionNotes }, getAuthConfig());
    return response.data;
};

const rejectTicket = async (ticketId, rejectedReason) => {
    const response = await axios.patch(`${API_URL}/${ticketId}/reject`, { rejectedReason }, getAuthConfig());
    return response.data;
};

const getTicketComments = async (ticketId) => {
    const response = await axios.get(`${API_URL}/${ticketId}/comments`, getAuthConfig());
    return response.data;
};

const addComment = async (ticketId, content) => {
    const response = await axios.post(`${API_URL}/${ticketId}/comments`, { content }, getAuthConfig());
    return response.data;
};

const updateComment = async (commentId, content) => {
    const response = await axios.patch(`${API_URL}/comments/${commentId}`, { content }, getAuthConfig());
    return response.data;
};

const deleteComment = async (commentId) => {
    const response = await axios.delete(`${API_URL}/comments/${commentId}`, getAuthConfig());
    return response.data;
};

const deleteTicket = async (ticketId) => {
    const response = await axios.delete(`${API_URL}/${ticketId}`, getAuthConfig());
    return response.data;
};

export const ticketService = {
    createTicket,
    getMyTickets,
    getTicketById,
    getAssignedToMe,
    getAllTickets,
    assignTicket,
    updateTicketStatus,
    rejectTicket,
    getTicketComments,
    addComment,
    updateComment,
    deleteComment,
    deleteTicket
};