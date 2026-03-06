export async function ensureNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones de escritorio');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return 'denied';
}

export function canNotify(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}

export function showNotification(title: string, options: NotificationOptions & { onClickUrl?: string }): void {
    if (!canNotify()) return;

    const notification = new Notification(title, options);

    if (options.onClickUrl) {
        notification.onclick = (e) => {
            e.preventDefault();
            // Esta aproximación usa window.open a una nueva pestaña o trata de enfocar la actual
            window.open(options.onClickUrl, '_blank');
            notification.close();
        };
    }

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        notification.close();
    }, 5000);
}
