import React, { useMemo, useState, useEffect } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2 } from 'lucide-react';

const monthKey = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM

const History: React.FC = () => {
  const { sessions, students, deleteClassSession } = useStudentData();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const getStudentName = (id: string) =>
    students.find(s => s.id === id)?.name || 'Unknown Student';

  /* ✅ 从 sessions 里自动生成可选月份 */
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.slice(0, 7)); // YYYY-MM
      }
    });
    // 最新月份排在最前
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [sessions]);

  /* ✅ 默认选最新月份 */
  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  /* ✅ 根据学生 + 月份筛选 */
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => monthKey(s.date) === selectedMonth)
      .filter(s => (selectedStudentId === 'ALL' ? true : s.studentId === selectedStudentId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, selectedMonth, selectedStudentId]);

  /* ✅ 当前筛选条件下的总课时 */
  const totalHours = useMemo(() => {
    return filteredSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  }, [filteredSessions]);

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="ALL">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* ✅ Month 下拉选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              disabled={availableMonths.length === 0}
            >
              {availableMonths.length === 0 ? (
                <option value="">No data yet</option>
              ) : (
                availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 总课时 */}
      <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg shadow-rose-200">
        <p className="text-rose-100 text-sm">
          Total Hours · {selectedMonth}
          {selectedStudentId === 'ALL' ? '' : ` · ${getStudentName(selectedStudentId)}`}
        </p>
        <p className="text-3xl font-bold">{totalHours} hrs</p>
      </div>

      {/* 历史记录 */}
      <h2 className="text-lg font-bold text-gray-800 mb-2">Class History</h2>

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No classes for this selection.
          </div>
        ) : (
          filteredSessions.map(session => (
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