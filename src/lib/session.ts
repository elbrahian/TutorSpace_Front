import type { User } from '../types';

const SESSION_KEY = 'tutorspace.session';

export function getSession(): User | null {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as User;
    } catch (err) {
        return null;
    }
}

export function saveSession(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}
