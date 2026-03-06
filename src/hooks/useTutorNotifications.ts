import { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { fetchTutorThreads, type ThreadCardResponse, type ChatMessage } from '../lib/chatApi';
import { showNotification } from '../lib/notifications';

export function useTutorNotifications(tutorId: number) {
    const [threads, setThreads] = useState<ThreadCardResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);

    // Set for deduplicating notifications
    const notifiedMessageIds = useRef<Set<number>>(new Set());

    // We keep a ref of the threads to subscribe to new ones without recreating the client
    const threadsRef = useRef<ThreadCardResponse[]>([]);
    const subscriptionsRef = useRef<Map<number, any>>(new Map());

    useEffect(() => {
        threadsRef.current = threads;
    }, [threads]);

    const connectToStomp = useCallback((tId: number) => {
        const brokerURL = 'ws://localhost:8080/ws';

        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // Subscribe to new threads for this tutor
            client.subscribe(`/topic/tutor.${tId}.threads`, (message) => {
                if (message.body) {
                    const payload = JSON.parse(message.body);
                    if (payload && payload.thread) {
                        const newThread = payload.thread as ThreadCardResponse;

                        setThreads((prevThreads) => {
                            const exists = prevThreads.find(t => t.id === newThread.id);
                            if (!exists) {
                                showNotification('Nuevo chat', {
                                    body: `Nuevo mensaje/solicitud de ${newThread.studentName}`,
                                    onClickUrl: `/chat/${newThread.id}`
                                });

                                // Sub to this new thread explicitly
                                subscribeToThreadMessages(client, newThread.id, tId);
                                return [newThread, ...prevThreads];
                            }
                            return prevThreads.map(t => t.id === newThread.id ? newThread : t);
                        });
                    }
                }
            });

            // Subscribe to all existing threads
            threadsRef.current.forEach(thread => {
                subscribeToThreadMessages(client, thread.id, tId);
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;

        return client;
    }, []);

    const subscribeToThreadMessages = (client: Client, threadId: number, tId: number) => {
        if (subscriptionsRef.current.has(threadId)) return; // Already subscribed

        const sub = client.subscribe(`/topic/thread.${threadId}`, (message) => {
            if (message.body) {
                const newMsg: ChatMessage = JSON.parse(message.body);

                setThreads(prevThreads => {
                    const threadIndex = prevThreads.findIndex(t => t.id === threadId);
                    if (threadIndex === -1) return prevThreads;

                    const thread = prevThreads[threadIndex];

                    // Trigger notification if not from me, and not already notified
                    if (newMsg.senderId !== tId && !notifiedMessageIds.current.has(newMsg.id)) {
                        notifiedMessageIds.current.add(newMsg.id);
                        showNotification(thread.studentName, {
                            body: newMsg.text,
                            onClickUrl: `/chat/${thread.id}`
                        });
                    }

                    // Update lastMessage and bubble to top
                    const updatedThread = { ...thread, lastMessage: newMsg };
                    const newThreads = [...prevThreads];
                    newThreads.splice(threadIndex, 1);
                    return [updatedThread, ...newThreads];
                });
            }
        });

        subscriptionsRef.current.set(threadId, sub);
    };

    const disconnectFromStomp = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            subscriptionsRef.current.clear();
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadThreads = async () => {
            try {
                const data = await fetchTutorThreads(tutorId);
                if (mounted) {
                    setThreads(data);
                    threadsRef.current = data;
                    connectToStomp(tutorId);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || 'Error al cargar los chats.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadThreads();

        return () => {
            mounted = false;
            disconnectFromStomp();
        };
    }, [tutorId, connectToStomp, disconnectFromStomp]);

    return {
        threads,
        loading,
        error
    };
}
