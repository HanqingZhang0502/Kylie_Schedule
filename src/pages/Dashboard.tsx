import React, { useState } from 'react';
import { useStudentData } from '../context/StudentContext';


const Dashboard: React.FC = () => {
    const { students, addClassSession } = useStudentData();
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [duration, setDuration] = useState(1);
    const [note, setNote] = useState('');

    const handleQuickLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        addClassSession(selectedStudentId, new Date().toISOString().split('T')[0], duration, note);

        // Reset form
        setSelectedStudentId('');
        setDuration(1);
        setNote('');
        alert('Class logged successfully!');
    };

    return (
        <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Log Class</h2>
                <form onSubmit={handleQuickLog} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select a student...</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hrs)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={duration}
                                onChange={(e) => setDuration(parseFloat(e.target.value))}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Rumba Basics"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedStudentId}
                        className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        Log Class
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Recent Activity</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center text-gray-500">
                    No recent activity yet.
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
