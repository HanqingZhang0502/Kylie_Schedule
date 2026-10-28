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

  folder?: string;      // 1=授课记录 2=学习记录 3=课包记录 4=在外私课
  // 课包第几包、包内第几条，不再存字段，统一由 src/lib/package.ts 按日期现算。

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AppData {
  students: Student[];
  sessions: ClassSession[];
}

// ====== 随手记 / 周常课表：完全独立于学生和课时记录 ======

export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;
export type WeekDay = typeof WEEKDAYS[number];

export type ScheduleColor = 'rose' | 'violet' | 'sky' | 'amber';

export interface ScheduleBlock {
  id: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  label: string;
  color: ScheduleColor;
}

export type WeeklySchedule = Record<WeekDay, ScheduleBlock[]>;