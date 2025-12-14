export interface Student {
    id: string;
    name: string;
    note?: string;
    createdAt: string;
}

export interface ClassSession {
    id: string;
    studentId: string;
    date: string; // ISO date string YYYY-MM-DD
    duration: number; // in hours or units
    note?: string;
    createdAt: string;
}

export interface AppData {
    students: Student[];
    sessions: ClassSession[];
}
