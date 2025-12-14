import React, { useState } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2, UserPlus } from 'lucide-react';

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
                <h2 className="text-xl font-bold text-gray-800">My Students ({students.length})</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-rose-100 text-rose-700 p-2 rounded-full hover:bg-rose-200 transition-colors"
                >
                    <UserPlus size={20} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Student Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 border-b border-gray-200 focus:border-rose-500 outline-none"
                            autoFocus
                            required
                        />
                        <input
                            type="text"
                            placeholder="Note (e.g. Level 1)"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full p-2 border-b border-gray-200 focus:border-rose-500 outline-none"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-500 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium"
                            >
                                Add Student
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {students.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No students yet. Tap + to add one.
                    </div>
                ) : (
                    students.map(student => (
                        <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-800">{student.name}</h3>
                                {student.note && <p className="text-sm text-gray-500">{student.note}</p>}
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this student?')) deleteStudent(student.id);
                                }}
                                className="text-gray-300 hover:text-red-500 p-2"
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
