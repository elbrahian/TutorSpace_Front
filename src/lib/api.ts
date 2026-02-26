import type { User, Tutor, TutorCategory } from '../types';

const API_BASE = 'http://localhost:8080';

export async function login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        throw new Error('Error de login: Verifica tus credenciales');
    }
    return res.json();
}

export async function fetchTutors(category?: string): Promise<Tutor[]> {
    const url = category && category !== 'ALL'
        ? `${API_BASE}/tutors?category=${category}`
        : `${API_BASE}/tutors`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Error al obtener tutores');
    }
    return res.json();
}

export async function createTutor(
    name: string,
    email: string,
    password: string,
    tutorCategory: TutorCategory
): Promise<Tutor> {
    const res = await fetch(`${API_BASE}/admin/tutors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, tutorCategory })
    });
    if (!res.ok) {
        throw new Error('Error al crear tutor. Verifique que el email no esté duplicado.');
    }
    return res.json();
}
