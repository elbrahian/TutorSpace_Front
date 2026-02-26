import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { fetchTutors } from '../lib/api';
import type { Tutor } from '../types';

export default function Student() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadTutors = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchTutors(filter);
                if (mounted) {
                    setTutors(data);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || 'Error al cargar tutores');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTutors();

        return () => { mounted = false; };
    }, [filter]);

    return (
        <>
            <Header />
            <div className="container">
                <h2 className="mb-4">Panel de Estudiante</h2>

                <div className="card mb-4" style={{ border: '2px dashed var(--border)', background: 'transparent' }}>
                    <h3 className="mb-4">Calendario (demo)</h3>
                    <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        [Placeholder del Calendario de Tutorías agendadas]
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3>Buscar tutorías</h3>
                        <div style={{ width: '200px' }}>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="ALL">Todas las categorías</option>
                                <option value="EXACTAS">Ciencias exactas</option>
                                <option value="PROGRAMACION">Programación</option>
                                <option value="OTRAS">Otras</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="error-text mb-4">{error}</div>}

                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Cargando tutores...</p>
                    ) : tutors.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No hay tutores disponibles en esta categoría.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {tutors.map(tutor => (
                                <div key={tutor.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.375rem' }}>
                                    <h4 style={{ marginBottom: '0.25rem', color: 'var(--primary)' }}>{tutor.name}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        {tutor.tutorCategory}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{tutor.email}</p>

                                    <button disabled style={{ width: '100%', fontSize: '0.75rem' }}>
                                        Abrir chat (próximamente)
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
