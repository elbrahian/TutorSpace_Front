export interface ThreadResponse {
    id: number;
    studentId: number;
    tutorId: number;
}

export interface ChatMessage {
    id: number;
    threadId: number;
    senderId: number;
    text: string;
    createdAt: string;
}

export interface ThreadCardResponse {
    id: number;
    studentId: number;
    studentName: string;
    tutorId: number;
    tutorName: string;
    createdAt: string;
    lastMessage: ChatMessage | null;
}

const API_BASE_URL = 'http://localhost:8080';

export async function getOrCreateThread(studentId: number, tutorId: number): Promise<ThreadResponse> {
    const response = await fetch(`${API_BASE_URL}/chats/thread`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, tutorId }),
    });

    if (!response.ok) {
        throw new Error('Error creating/fetching chat thread');
    }

    return response.json();
}

export async function fetchMessages(threadId: number): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/chats/${threadId}/messages`);

    if (!response.ok) {
        throw new Error('Error fetching messages');
    }

    return response.json();
}

export async function fetchTutorThreads(tutorId: number): Promise<ThreadCardResponse[]> {
    const response = await fetch(`${API_BASE_URL}/chats/tutor/${tutorId}`);

    if (!response.ok) {
        throw new Error('Error fetching tutor threads');
    }

    return response.json();
}
