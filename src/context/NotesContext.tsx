import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { WeeklySchedule, WeekDay, ScheduleBlock, ScheduleColor } from '../types';
import { WEEKDAYS } from '../types';

const emptySchedule = (): WeeklySchedule =>
  WEEKDAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as WeeklySchedule);

const makeBlockId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// 高亮颜色按"这一行的文字内容"记，不按行号——这样她在前面插入/删除行，
// 已经标过色的行不会跟着错位（代价是：如果改了某一行的文字，那一行的颜色会跟着丢，
// 需要重新标一下，这个取舍对"随手记"这种常改的场景来说是合理的）。
export type LineColors = Record<string, ScheduleColor>;

interface NotesContextType {
  // 随手记
  quickNote: string;
  quickNoteLoaded: boolean;
  saveQuickNote: (content: string) => Promise<void>;
  quickNoteLineColors: LineColors;
  setLineColor: (lineText: string, color: ScheduleColor | null) => Promise<void>;

  // 周常课表
  weeklySchedule: WeeklySchedule;
  addScheduleBlock: (day: WeekDay, block: Omit<ScheduleBlock, 'id'>) => Promise<void>;
  updateScheduleBlock: (day: WeekDay, id: string, updates: Partial<Omit<ScheduleBlock, 'id'>>) => Promise<void>;
  deleteScheduleBlock: (day: WeekDay, id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [quickNote, setQuickNote] = useState('');
  const [quickNoteLoaded, setQuickNoteLoaded] = useState(false);
  const [quickNoteLineColors, setQuickNoteLineColors] = useState<LineColors>({});
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(emptySchedule());

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(u => setUser(u));

    if (!user) {
      setQuickNote('');
      setQuickNoteLoaded(false);
      setQuickNoteLineColors({});
      setWeeklySchedule(emptySchedule());
      return () => unsubAuth();
    }

    const noteRef = doc(db, 'users', user.uid, 'misc', 'quickNote');
    const unsubNote = onSnapshot(noteRef, (snap) => {
      setQuickNote((snap.data()?.content as string) ?? '');
      setQuickNoteLineColors((snap.data()?.lineColors as LineColors) ?? {});
      setQuickNoteLoaded(true);
    });

    const scheduleRef = doc(db, 'users', user.uid, 'misc', 'weeklySchedule');
    const unsubSchedule = onSnapshot(scheduleRef, (snap) => {
      const data = snap.data()?.days as Partial<WeeklySchedule> | undefined;
      setWeeklySchedule({ ...emptySchedule(), ...(data ?? {}) });
    });

    return () => {
      unsubNote();
      unsubSchedule();
      unsubAuth();
    };
  }, [user]);

  const saveQuickNote = async (content: string) => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid, 'misc', 'quickNote'),
      { content, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const setLineColor = async (lineText: string, color: ScheduleColor | null) => {
    if (!user) return;
    const next: LineColors = { ...quickNoteLineColors };
    if (color) {
      next[lineText] = color;
    } else {
      delete next[lineText];
    }
    await setDoc(
      doc(db, 'users', user.uid, 'misc', 'quickNote'),
      { lineColors: next, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const writeSchedule = async (next: WeeklySchedule) => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid, 'misc', 'weeklySchedule'),
      { days: next, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const addScheduleBlock = async (day: WeekDay, block: Omit<ScheduleBlock, 'id'>) => {
    const next: WeeklySchedule = {
      ...weeklySchedule,
      [day]: [...weeklySchedule[day], { ...block, id: makeBlockId() }],
    };
    await writeSchedule(next);
  };

  const updateScheduleBlock = async (
    day: WeekDay,
    id: string,
    updates: Partial<Omit<ScheduleBlock, 'id'>>
  ) => {
    const next: WeeklySchedule = {
      ...weeklySchedule,
      [day]: weeklySchedule[day].map(b => (b.id === id ? { ...b, ...updates } : b)),
    };
    await writeSchedule(next);
  };

  const deleteScheduleBlock = async (day: WeekDay, id: string) => {
    const next: WeeklySchedule = {
      ...weeklySchedule,
      [day]: weeklySchedule[day].filter(b => b.id !== id),
    };
    await writeSchedule(next);
  };

  return (
    <NotesContext.Provider
      value={{
        quickNote,
        quickNoteLoaded,
        saveQuickNote,
        quickNoteLineColors,
        setLineColor,
        weeklySchedule,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export type { ScheduleColor };
