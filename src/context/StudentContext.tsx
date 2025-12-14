import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, ClassSession, AppData } from '../types';

interface StudentContextType {
    students: Student[];
    sessions: ClassSession[];
    addStudent: (name: string, note?: string) => void;
    deleteStudent: (id: string) => void;
    addClassSession: (studentId: string, date: string, duration: number, note?: string) => void;
    deleteClassSession: (id: string) => void;
    getStudentSessions: (studentId: string) => ClassSession[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEY = 'kylie_schedule_data';

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<ClassSession[]>([]);

    // Load data from local storage on mount
    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                const parsed: AppData = JSON.parse(storedData);
                setStudents(parsed.students || []);
                setSessions(parsed.sessions || []);
            } catch (e) {
                console.error("Failed to parse stored data", e);
            }
        }
    }, []);

    // Save data to local storage whenever it changes
    useEffect(() => {
        const data: AppData = { students, sessions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [students, sessions]);

    const addStudent = (name: string, note?: string) => {
        const newStudent: Student = {
            id: crypto.randomUUID(),
            name,
            note,
            createdAt: new Date().toISOString(),
        };
        setStudents(prev => [...prev, newStudent]);
    };

    const deleteStudent = (id: string) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        // Also delete associated sessions? Maybe keep them for history?
        // For now, let's keep them but they will be orphaned. 
        // Or we can cascade delete. Let's cascade delete for cleanliness.
        setSessions(prev => prev.filter(s => s.studentId !== id));
    };

    const addClassSession = (studentId: string, date: string, duration: number, note?: string) => {
        const newSession: ClassSession = {
            id: crypto.randomUUID(),
            studentId,
            date,
            duration,
            note,
            createdAt: new Date().toISOString(),
        };
        setSessions(prev => [...prev, newSession]);
    };

    const deleteClassSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
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
