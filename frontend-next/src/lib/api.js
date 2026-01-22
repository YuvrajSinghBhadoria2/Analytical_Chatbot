// Basic API client for the analytical backend

const API_BASE_URL = 'http://localhost:8000'; // Make this configurable via env

export const api = {
    // Get all conversations
    getConversations: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/conversation/all`);
            if (!res.ok) throw new Error('Failed to fetch conversations');
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    // Create new conversation
    createConversation: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/new_conversation`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to create conversation');
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // Get specific conversation details
    getConversation: async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/conversation/${id}`);
            if (res.status === 404) return null; // Gracefully handle not found
            if (!res.ok) throw new Error('Failed to fetch conversation');
            return await res.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    // Stream response - helper for EventSource usage
    getChatEndpoint: () => `${API_BASE_URL}/chat/conversation`,
};
