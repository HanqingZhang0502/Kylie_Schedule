import React from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2 } from 'lucide-react';

const History: React.FC = () => {
  const { sessions, students, deleteClassSession } = useStudentData();

  // Sort mode: by createdAt (recently added) or by class date
  const [sortMode, setSortMode] = React.useState<'createdAt' | 'classDate'>('createdAt');

  // Avoid Safari/iOS date parsing issues with YYYY-MM-DD
  const parseDateUTC = (d: string) => {
    const [y, m, day] = d.split('-').map(Number);
    return Date.UTC(y, m - 1, day);
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortMode === 'createdAt') {
      const aMs = a.createdAt ? a.createdAt.toMillis() : 0;
      const bMs = b.createdAt ? b.createdAt.toMillis() : 0;
      return bMs - aMs;
    } else {
      return parseDateUTC(b.date) - parseDateUTC(a.date);
    }
  });

  const getStudentName = (id: string) => {
    return students.find(s => s.id === id)?.name || 'Unknown Student';
  };

  const totalHours = sessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-4">
      <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg shadow-rose-200 mb-6">
        <p className="text-rose-100 text-sm">Total Hours Recorded</p>
        <p className="text-3xl font-bold">{totalHours} hrs</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Class History</h2>

        <button
          className="text-sm text-rose-600 hover:underline"
          onClick={() => setSortMode(sortMode === 'createdAt' ? 'classDate' : 'createdAt')}
        >
          Sort: {sortMode === 'createdAt' ? 'Recently Added' : 'Class Date'}
        </button>
      </div>

      <div className="space-y-3">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No classes recorded yet.
          </div>
        ) : (
          sortedSessions.map(session => (
            <div
              key={session.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">
                    {getStudentName(session.studentId)}
                  </h3>
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    {session.duration}h
                  </span>
                </div>

                <p className="text-sm text-gray-500">{session.date}</p>

                {session.note && (
                  <p className="text-sm text-gray-400 mt-1 italic">"{session.note}"</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (confirm('Delete this record?')) deleteClassSession(session.id);
                }}
                className="text-gray-300 hover:text-red-500 p-2"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;