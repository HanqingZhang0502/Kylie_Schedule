import type { Timestamp } from "firebase/firestore";

export interface Student {
  id: string;
  name: string;
  note?: string;
  createdAt?: Timestamp; // serverTimestamp() 写入后读出来是 Timestamp
}

export interface ClassSession {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  duration: number;
  note?: string;
  createdAt?: Timestamp;
}

export interface AppData {
  students: Student[];
  sessions: ClassSession[];
}