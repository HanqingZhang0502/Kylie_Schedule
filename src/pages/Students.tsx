import React, { useState } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2, UserPlus } from 'lucide-react';
import { sketchInput, sketchCard, sketchBtnPrimary, sketchBtnSecondary } from '../lib/sketchStyles';

const Students: React.FC = () => {
    const { students, addStudent, deleteStudent } = useStudentData();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newNote, setNewNote] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            addStudent(newName, newNote);
            setNewName('');
            setNewNote('');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-marker text-2xl font-bold text-ink">My Students ({students.length})</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-highlight text-accent p-2 rounded-sketch border border-line shadow-sketch-sm hover:-rotate-1 transition-transform"
                >
                    <UserPlus size={20} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className={`${sketchCard} p-4 animate-in fade-in slide-in-from-top-4`}>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Student Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className={`w-full ${sketchInput}`}
                            autoFocus
                            required
                        />
                        <input
                            type="text"
                            placeholder="Note (e.g. Level 1)"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className={`w-full ${sketchInput}`}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className={`${sketchBtnSecondary} px-4 py-2 text-sm`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`${sketchBtnPrimary} px-4 py-2 text-sm`}
                            >
                                Add Student
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {students.length === 0 ? (
                    <div className="font-hand text-center py-10 text-ink-muted">
                        No students yet. Tap + to add one.
                    </div>
                ) : (
                    students.map(student => (
                        <div key={student.id} className={`${sketchCard} p-4 flex justify-between items-center`}>
                            <div>
                                <h3 className="font-hand text-lg text-ink">{student.name}</h3>
                                {student.note && <p className="font-hand text-sm text-ink-muted">{student.note}</p>}
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this student?')) deleteStudent(student.id);
                                }}
                                className="text-line hover:text-accent p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Students;
