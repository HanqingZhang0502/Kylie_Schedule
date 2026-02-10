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

  folder?: string;      // 1=授课记录 2=学习记录 3=课包记录
  packageNo?: number;   // ✅ NEW: 课包期数（1,2,3...）仅用于 folder=2/3

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AppData {
  students: Student[];
  sessions: ClassSession[];
}