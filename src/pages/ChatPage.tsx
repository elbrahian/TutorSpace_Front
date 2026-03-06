import { useEffect, useState, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { getSession } from '../lib/session';
import { fetchMessages } from '../lib/chatApi';
import { useChatStomp } from '../hooks/useChatStomp';
import Header from '../components/Header';

export default function ChatPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const navigate = useNavigate();
    const session = getSession();
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');

    // Si no hay sesión, redirect a login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Si el rol es admin, no debería estar aquí
    if (session.role === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    const numericThreadId = threadId ? parseInt(threadId, 10) : null;
    const { messages, setMessages, connected, sendMessage } = useChatStomp(numericThreadId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!numericThreadId) return;

        const loadMessages = async () => {
            try {
                const history = await fetchMessages(numericThreadId);
                setMessages(history);
            } catch (err) {
                console.error("Error al cargar mensajes del historial", err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [numericThreadId, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text || !numericThreadId) return;

        sendMessage(session.id, text);
        setInputText('');
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p>Cargando chat...</p>
                </div>
            </>
        );
    }

    if (!numericThreadId) {
        return (
            <>
                <Header />
                <div className="container">
                    <p>Error: ID de chat inválido.</p>
                </div>
            </>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header />
            <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem' }}
                    >
                        &larr; Volver
                    </button>
                    <h2>Chat</h2>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: connected ? 'green' : 'red' }}>
                            {connected ? '● Conectado' : '○ Desconectado'}
                        </span>
                    </div>
                </div>

                <div
                    className="card"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
                >
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay mensajes en este chat. ¡Envía el primero!</p>
                        ) : (
                            messages.map((msg, index) => {
                                const isMine = msg.senderId === session.id;
                                return (
                                    <div
                                        key={msg.id || index}
                                        style={{
                                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                                            backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-card)',
                                            color: isMine ? 'white' : 'var(--text)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '1rem',
                                            border: isMine ? 'none' : '1px solid var(--border)',
                                            maxWidth: '75%',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                style={{ flex: 1 }}
                                disabled={!connected}
                            />
                            <button type="submit" disabled={!inputText.trim() || !connected}>
                                Enviar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
