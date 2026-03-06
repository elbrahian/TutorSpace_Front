import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getSession } from '../lib/session';
import { fetchTutorThreads } from '../lib/chatApi';
import type { ThreadCardResponse } from '../lib/chatApi';
import { ensureNotificationPermission } from '../lib/notifications';
import { useTutorPushNotifications } from '../hooks/useTutorPushNotifications';

export default function Tutor() {
    const session = getSession();
    const navigate = useNavigate();

    const [threads, setThreads] = useState<ThreadCardResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        const result = await ensureNotificationPermission();
        setPermission(result);
    };

    // Callback llamado por el hook STOMP cuando entra un thread nuevo
    const handleNewThread = useCallback((newThread: ThreadCardResponse) => {
        setThreads(prev => {
            const exists = prev.find(t => t.id === newThread.id);
            if (exists) {
                return prev.map(t => t.id === newThread.id ? newThread : t);
            }
            return [newThread, ...prev];
        });
    }, []);

    // Lanzar hook global de notificaciones Push (se desconecta solo al desmontar)
    useTutorPushNotifications(threads, handleNewThread);

    useEffect(() => {
        if (!session || session.role !== 'TUTOR') return;

        let mounted = true;

        const loadThreads = async () => {
            try {
                const data = await fetchTutorThreads(session.id);
                if (mounted) {
                    setThreads(data);
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
        };
    }, [session]);

    // Redirecciones
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (session.role !== 'TUTOR') {
        if (session.role === 'ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/student" replace />;
    }

    return (
        <>
            <Header />
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-4">
                    <h2>Panel de Tutor</h2>

                    <div>
                        {permission === 'default' && (
                            <button onClick={requestPermission} style={{ background: 'var(--primary)', color: 'white', marginRight: '1rem' }}>
                                Activar notificaciones
                            </button>
                        )}
                        <span style={{ fontSize: '0.875rem', color: permission === 'granted' ? 'green' : 'var(--text-secondary)' }}>
                            Notificaciones: {permission === 'granted' ? 'Activas' : (permission === 'denied' ? 'Bloqueadas' : 'Pendientes')}
                        </span>
                    </div>
                </div>

                <div className="card mb-4" style={{ border: '2px dashed var(--border)', background: 'transparent' }}>
                    <h3 className="mb-4">Calendario (demo)</h3>
                    <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        [Placeholder del Calendario de Tutorías agendadas]
                    </div>
                </div>

                <div className="card">
                    <h3 className="mb-4">Tus Chats</h3>

                    {error && <div className="error-text mb-4">{error}</div>}

                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Cargando chats...</p>
                    ) : threads.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No tienes chats activos aún.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {threads.map(thread => (
                                <div
                                    key={thread.id}
                                    style={{
                                        border: '1px solid var(--border)',
                                        padding: '1rem',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem', color: 'var(--primary)' }}>{thread.studentName}</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {thread.lastMessage ? thread.lastMessage.text : "Sin mensajes"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/chat/${thread.id}`)}
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    >
                                        Abrir
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
