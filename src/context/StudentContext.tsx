import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Student, ClassSession } from '../types';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface StudentContextType {
  students: Student[];
  sessions: ClassSession[];
  addStudent: (name: string, note?: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addClassSession: (studentId: string, date: string, duration: number, note?: string) => Promise<void>;
  deleteClassSession: (id: string) => Promise<void>;
  getStudentSessions: (studentId: string) => ClassSession[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [user, setUser] = useState<User | null>(() => auth.currentUser);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(u => setUser(u));

    if (!user) {
      setStudents([]);
      setSessions([]);
      return () => unsubAuth();
    }

    // users/{uid}/students
    const studentsRef = collection(db, "users", user.uid, "students");
    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      const loadedStudents = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Student, "id">),
      })) as Student[];
      setStudents(loadedStudents);
    });

    // users/{uid}/sessions
    const sessionsRef = collection(db, "users", user.uid, "sessions");
    const unsubSessions = onSnapshot(sessionsRef, (snapshot) => {
      const loadedSessions = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<ClassSession, "id">),
      })) as ClassSession[];
      setSessions(loadedSessions);
    });

    return () => {
      unsubStudents();
      unsubSessions();
      unsubAuth();
    };
  }, [user]);

  const addStudent = async (name: string, note?: string) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "students"), {
      name,
      note,
      createdAt: serverTimestamp(),
    });
  };

  const deleteStudent = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "students", id));
  };

  const addClassSession = async (studentId: string, date: string, duration: number, note?: string) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "sessions"), {
      studentId,
      date,
      duration,
      note,
      createdAt: serverTimestamp(),
    });
  };

  const deleteClassSession = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "sessions", id));
  };

  const getStudentSessions = (studentId: string) => {
    return sessions.filter(s => s.studentId === studentId);
  };

  return (
    <StudentContext.Provider value={{
      students,
      sessions,
      addStudent,
      deleteStudent,
      addClassSession,
      deleteClassSession,
      getStudentSessions
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudentData must be used within a StudentProvider');
  }
  return context;
};
