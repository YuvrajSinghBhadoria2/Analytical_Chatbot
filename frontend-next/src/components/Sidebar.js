"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, MessageSquare, ExternalLink, LogOut, User } from 'lucide-react';
import { api } from '@/lib/api';

export default function Sidebar() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        loadConversations();

        // Listen for updates from ChatInterface
        const handleUpdate = () => loadConversations();
        window.addEventListener('chat-update', handleUpdate);
        return () => window.removeEventListener('chat-update', handleUpdate);
    }, [pathname]); // Reload when path changes (e.g. new chat created)

    const loadConversations = async () => {
        try {
            const data = await api.getConversations();
            // Sort by updated_at desc
            const sorted = (data || []).sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );
            setConversations(sorted);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            const newConv = await api.createConversation();
            if (newConv && newConv.conversation_id) {
                router.push(`/c/${newConv.conversation_id}`);
                // loadConversations will trigger via useEffect
            }
        } catch (error) {
            console.error('Failed to create new chat', error);
        }
    };

    return (
        <div className="flex flex-col h-full w-[260px] bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] transition-all">
            {/* New Chat Button */}
            <div className="p-3">
                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-white/20 transition-colors duration-200 hover:bg-[var(--sidebar-hover)] text-sm text-white mb-1"
                >
                    <Plus size={16} />
                    <span>New chat</span>
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                <div className="flex flex-col gap-2 pb-2 text-sm text-gray-100">
                    {!loading && conversations.length === 0 && (
                        <div className="px-3 text-gray-400 text-xs">No conversations yet.</div>
                    )}

                    {conversations.map((conv) => {
                        const isActive = pathname === `/c/${conv.conversation_id}`;
                        // If alias is missing, show ID or fallback
                        const label = conv.alias || conv.messages?.[0]?.content || "New conversation";
                        const truncatedLabel = label.length > 25 ? label.substring(0, 25) + '...' : label;

                        return (
                            <Link
                                key={conv.conversation_id}
                                href={`/c/${conv.conversation_id}`}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-colors duration-200 hover:bg-[var(--sidebar-hover)] ${isActive ? 'bg-[var(--sidebar-hover)]' : ''
                                    }`}
                            >
                                <MessageSquare size={16} className="text-gray-300" />
                                <div className="flex-1 overflow-hidden relative truncate">
                                    {truncatedLabel}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Footer / User Profile section */}
            <div className="border-t border-white/20 p-3">
                <button className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors duration-200 text-sm text-white">
                    <User size={16} />
                    <div className="font-bold">Upgrade to Plus</div>
                </button>
                <div className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors duration-200 text-sm text-white mt-1 cursor-pointer">
                    <div className="w-5 h-5 rounded-sm bg-purple-600 flex items-center justify-center text-xs">U</div>
                    <span>User</span>
                </div>
            </div>
        </div>
    );
}
