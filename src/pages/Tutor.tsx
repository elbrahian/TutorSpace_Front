import Header from '../components/Header';

export default function Tutor() {
    return (
        <>
            <Header />
            <div className="container">
                <h2 className="mb-4">Panel de Tutor</h2>

                <div className="card" style={{ border: '2px dashed var(--border)', background: 'transparent', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    [Calendario + chats (demo)]
                </div>
            </div>
        </>
    );
}
