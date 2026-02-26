import { useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../lib/session';

export default function Header() {
    const user = getSession();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearSession();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">TutorSpace UCO</div>
                {user && (
                    <div className="header-user">
                        <span>Hola, <strong>{user.name}</strong> ({user.role})</span>
                        <button onClick={handleLogout}>Salir</button>
                    </div>
                )}
            </div>
        </header>
    );
}
