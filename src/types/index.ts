export type Role = "STUDENT" | "TUTOR" | "ADMIN";
export type TutorCategory = "EXACTAS" | "PROGRAMACION" | "OTRAS";

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    tutorCategory: TutorCategory | null;
}

export interface Tutor {
    id: number;
    name: string;
    email: string;
    tutorCategory: TutorCategory;
}

export interface LoginResponse extends User { }
