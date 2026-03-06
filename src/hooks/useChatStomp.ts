import { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { ChatMessage } from '../lib/chatApi';
import { showNotification } from '../lib/notifications';
import { getSession } from '../lib/session';

export function useChatStomp(threadId: number | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    const connect = useCallback((thread: number) => {
        const brokerURL = 'ws://localhost:8080/ws';

        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            setConnected(true);
            client.subscribe(`/topic/thread.${thread}`, (message) => {
                if (message.body) {
                    const newMsg: ChatMessage = JSON.parse(message.body);
                    setMessages((prev) => {
                        // Evitar duplicados si hay re-renders raros del socket
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    // Notificar si el documento está oculto
                    const session = getSession();
                    if (document.hidden && session && newMsg.senderId !== session.id) {
                        showNotification('Nuevo mensaje en chat', {
                            body: newMsg.text,
                            onClickUrl: `/chat/${thread}`
                        });
                    }
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.onWebSocketError = (event) => {
            console.error('WebSocket Error: ', event);
        }

        client.onDisconnect = () => {
            setConnected(false);
        }

        client.activate();
        clientRef.current = client;
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setConnected(false);
        }
    }, []);

    const sendMessage = useCallback((senderId: number, text: string) => {
        if (clientRef.current && clientRef.current.connected && threadId) {
            clientRef.current.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({
                    threadId,
                    senderId,
                    text,
                }),
            });
        } else {
            console.error('Cannot send message, not connected.');
        }
    }, [threadId]);

    useEffect(() => {
        if (threadId) {
            connect(threadId);
        }

        return () => {
            disconnect();
        };
    }, [threadId, connect, disconnect]);

    return {
        messages,
        setMessages,
        connected,
        sendMessage,
    };
}
