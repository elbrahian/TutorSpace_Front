import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { getSession } from '../lib/session';
import { showNotification } from '../lib/notifications';
import type { ThreadCardResponse, ChatMessage } from '../lib/chatApi';

export function useTutorPushNotifications(threads: ThreadCardResponse[], onNewThreadStr?: (t: ThreadCardResponse) => void) {
    const session = getSession();
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Map<string, any>>(new Map());
    const notifiedMessageIds = useRef<Set<number>>(new Set());
    const threadsRef = useRef<ThreadCardResponse[]>(threads);

    useEffect(() => {
        threadsRef.current = threads;
    }, [threads]);

    const connect = useCallback(() => {
        if (!session || session.role !== 'TUTOR') return;

        const brokerURL = 'ws://localhost:8080/ws';
        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // 1) Suscribirse a nuevos threads
            const threadSubKey = `/topic/tutor.${session.id}.threads`;
            const threadSub = client.subscribe(threadSubKey, (message) => {
                if (message.body) {
                    const payload = JSON.parse(message.body);
                    if (payload && payload.thread) {
                        const newThread = payload.thread as ThreadCardResponse;

                        // Notificar el nuevo thread
                        showNotification('Nuevo chat', {
                            body: `Solicitud de chat de ${newThread.studentName}`,
                            onClickUrl: `/chat/${newThread.id}`
                        });

                        // Ejecutar callback para actualizar estado en componente padre
                        if (onNewThreadStr) {
                            onNewThreadStr(newThread);
                        }

                        // Inmediatamente suscribirnos a los mensajes de este nuevo thread
                        subscribeToMessages(client, newThread);
                    }
                }
            });
            subscriptionsRef.current.set(threadSubKey, threadSub);

            // 2) Suscribirse a los mensajes de los threads ALREADY EXITENTES
            threadsRef.current.forEach(t => {
                subscribeToMessages(client, t);
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame);
        };

        client.activate();
        clientRef.current = client;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.id, session?.role]);

    const subscribeToMessages = useCallback((client: Client, thread: ThreadCardResponse) => {
        const topicId = `/topic/thread.${thread.id}`;

        // Evitar doble suscripción al mismo thread
        if (subscriptionsRef.current.has(topicId)) return;

        const sub = client.subscribe(topicId, (message) => {
            if (message.body) {
                const newMsg: ChatMessage = JSON.parse(message.body);
                const isFromMe = newMsg.senderId === session?.id;

                // Evitar notificar si el mensaje es de uno mismo
                if (isFromMe) return;

                // Evitar notificar dos veces (cache Set)
                if (notifiedMessageIds.current.has(newMsg.id)) return;
                notifiedMessageIds.current.add(newMsg.id);

                // Evitar notificar si estoy activamente mirando EL MISMO chat
                const currentPath = window.location.pathname; // Ej: /chat/15
                const isLookingAtThisChat = currentPath === `/chat/${thread.id}` && !document.hidden;

                if (isLookingAtThisChat) return;

                // Disparar la notificación push
                showNotification(thread.studentName, {
                    body: newMsg.text,
                    onClickUrl: `/chat/${thread.id}`
                });
            }
        });

        subscriptionsRef.current.set(topicId, sub);
    }, [session?.id]);

    useEffect(() => {
        connect();

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            subscriptionsRef.current.clear();
        };
    }, [connect]);
}
