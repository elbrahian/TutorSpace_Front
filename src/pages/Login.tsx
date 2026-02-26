import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import { saveSession } from '../lib/session';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await login(email, password);
            saveSession(user);

            switch (user.role) {
                case 'STUDENT':
                    navigate('/student');
                    break;
                case 'TUTOR':
                    navigate('/tutor');
                    break;
                case 'ADMIN':
                    navigate('/admin');
                    break;
                default:
                    navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'Error de login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card">
                <h1 className="header-title text-center mb-4">TutorSpace Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ej: est1@uco.edu"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="error-text mb-4">{error}</div>}

                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-4" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <p><strong>Credenciales de prueba:</strong></p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>admin@uco.edu / admin123</li>
                        <li>est1@uco.edu / 1234</li>
                        <li>tutorprog@uco.edu / 1234</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
