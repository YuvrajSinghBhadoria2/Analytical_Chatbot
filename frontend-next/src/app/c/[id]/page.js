import ChatInterface from '@/components/ChatInterface';
import { api } from '@/lib/api';
import { redirect } from 'next/navigation';

// This is a Server Component fetching initial data
export default async function ChatPage({ params }) {
    const { id } = params;

    // Fetch conversation history server-side for initial render
    // Note: We need to handle this gracefully if it fails
    let initialMessages = [];
    try {
        const data = await api.getConversation(id);
        if (!data) {
            // Conversation not found, redirect to new chat
            redirect('/');
        }
        if (data && data.messages) {
            initialMessages = data.messages;
        }
    } catch (e) {
        // If redirect throws (which it does in Next.js), let it bubble up
        if (e.message === 'NEXT_REDIRECT') throw e;
        console.error("Failed to load conversation", e);
    }

    return (
        <div className="h-full flex-1">
            <ChatInterface conversationId={id} initialMessages={initialMessages} />
        </div>
    );
}
