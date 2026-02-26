import React, { useState } from 'react';
import Header from '../components/Header';
import { createTutor } from '../lib/api';
import type { TutorCategory, Tutor } from '../types';

export default function Admin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [category, setCategory] = useState<TutorCategory>('EXACTAS');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<Tutor | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const newTutor = await createTutor(name, email, password, category);
            setSuccess(newTutor);

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setCategory('EXACTAS');
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container" style={{ maxWidth: '600px' }}>
                <h2 className="mb-4">Panel de Administración</h2>

                <div className="card">
                    <h3 className="mb-4">Crear nuevo tutor</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Nombre completo</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Categoría</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as TutorCategory)}
                                >
                                    <option value="EXACTAS">Ciencias Exactas</option>
                                    <option value="PROGRAMACION">Programación</option>
                                    <option value="OTRAS">Otras</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="error-text mb-4">{error}</div>}
                        {success && (
                            <div className="success-text mb-4" style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #10b981' }}>
                                <strong>¡Tutor creado con éxito!</strong><br />
                                ID: {success.id} | Nombre: {success.name} | Cat: {success.tutorCategory}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Creando...' : 'Guardar Tutor'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
