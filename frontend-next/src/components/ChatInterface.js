"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface({ conversationId, initialMessages = [] }) {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const router = useRouter();
    const [streamingContent, setStreamingContent] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setStreamingContent('');

        let currentId = conversationId;

        try {
            // If no conversation ID, create one first
            if (!currentId) {
                const newConv = await api.createConversation();
                if (!newConv) throw new Error("Failed to create conversation");
                currentId = newConv.conversation_id;
                // Update URL without reloading
                window.history.pushState({}, '', `/c/${currentId}`);
                // Or use router.replace if prefer Next.js way, but we want to stay mounted
                // We might need to handle this carefully.
                // For now, let's just proceed with the currentId for the request.
            }

            // Start streaming request
            const response = await fetch(api.getChatEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation_id: currentId,
                    user_message: [{ type: 'text', text: userMessage }]
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullAssistantMessage = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: !done });

                // Parse SSE format: "data: {...}\n\n"
                const lines = chunkValue.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.content) {
                                fullAssistantMessage += data.content;
                                setStreamingContent(fullAssistantMessage);
                            }
                            if (data.error) {
                                console.error("Stream error:", data.error);
                            }
                        } catch (e) {
                            // ignore partial json
                        }
                    }
                }
            }

            // Finalize message
            setMessages(prev => [...prev, { role: 'assistant', content: fullAssistantMessage }]);
            setStreamingContent('');
            setIsLoading(false);

            // If we created a new chat, update the sidebar without reloading the chat component
            if (!conversationId && currentId) {
                window.dispatchEvent(new Event('chat-update'));
                // Ensure the router knows about the new path for future navigations, 
                // but do it silently if possible or just rely on pushState.
                // We already did pushState.
            } else {
                // Triggers sidebar update for existing chats too (timestamp update)
                window.dispatchEvent(new Event('chat-update'));
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'system', content: "Error sending message. Please try again." }]);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 pb-32">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <h1 className="text-4xl font-semibold mb-8">Analytical Chat</h1>
                        <p className="max-w-md text-sm">Ask anything about your data. The AI will analyze and provide insights.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`group w-full text-gray-800 dark:text-gray-100 border-b border-black/5 dark:border-white/5 ${msg.role === 'assistant' ? 'bg-[var(--ai-msg-bg)]' : 'bg-[var(--user-msg-bg)]'
                        }`}>
                        <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl flex lg:px-0 m-auto p-4 md:py-6">
                            <div className="w-[30px] flex flex-col relative items-end">
                                <div className={`relative h-[30px] w-[30px] p-1 rounded-sm flex items-center justify-center ${msg.role === 'user' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-green-500 text-white'}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                            </div>
                            <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                                <div className="flex flex-grow flex-col gap-3">
                                    <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words prose prose-neutral dark:prose-invert max-w-none text-black dark:text-gray-100">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-4 w-full"><table className="border-collapse table-auto w-full text-sm" {...props} /></div>,
                                                th: ({ node, ...props }) => <th className="border-b dark:border-white/20 border-black/10 px-4 py-2 text-left font-semibold" {...props} />,
                                                td: ({ node, ...props }) => <td className="border-b dark:border-white/10 border-black/5 px-4 py-2" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-4" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return inline ?
                                                        <code className="bg-black/10 dark:bg-white/10 rounded-sm px-1 py-0.5 font-mono text-sm" {...props}>{children}</code> :
                                                        <code className="block bg-black/10 dark:bg-white/10 rounded-md p-4 font-mono text-sm overflow-x-auto my-2" {...props}>{children}</code>
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Streaming Message Bubble */}
                {(isLoading && streamingContent) && (
                    <div className="group w-full text-gray-800 dark:text-gray-100 border-b border-black/5 dark:border-white/5 bg-[var(--ai-msg-bg)]">
                        <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl flex lg:px-0 m-auto p-4 md:py-6">
                            <div className="w-[30px] flex flex-col relative items-end">
                                <div className="relative h-[30px] w-[30px] p-1 rounded-sm flex items-center justify-center bg-green-500 text-white">
                                    <Bot size={18} />
                                </div>
                            </div>
                            <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                                <div className="flex flex-grow flex-col gap-3">
                                    <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words prose prose-neutral dark:prose-invert max-w-none text-black dark:text-gray-100">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-4 w-full"><table className="border-collapse table-auto w-full text-sm" {...props} /></div>,
                                                th: ({ node, ...props }) => <th className="border-b dark:border-white/20 border-black/10 px-4 py-2 text-left font-semibold" {...props} />,
                                                td: ({ node, ...props }) => <td className="border-b dark:border-white/10 border-black/5 px-4 py-2" {...props} />,
                                            }}
                                        >
                                            {streamingContent}
                                        </ReactMarkdown>
                                        <span className="w-2 h-4 bg-gray-500 inline-block animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {(isLoading && !streamingContent) && (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-gradient-to-t from-white dark:from-[var(--background-start-rgb)] to-transparent pt-0 md:pt-2">
                <div className="stretch mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                    <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                        <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 dark:border-gray-900/50 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                            <form onSubmit={handleSubmit} className="flex flex-row w-full items-center">
                                <input
                                    className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0 outline-none overflow-y-hidden h-[24px]"
                                    placeholder="Send a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || input.length === 0}
                                    className="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:hover:bg-transparent disabled:opacity-40 transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                        <div className="px-2 py-2 text-center text-xs text-gray-600 dark:text-gray-300 md:px-[60px]">
                            <span>AI can make mistakes. Consider checking important information.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
