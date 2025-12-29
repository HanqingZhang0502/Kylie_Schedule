import React, { useMemo, useState } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2 } from 'lucide-react';

const monthKey = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM from YYYY-MM-DD

const History: React.FC = () => {
  const { sessions, students, deleteClassSession } = useStudentData();

  // ✅ 选择：学生 + 月份
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`; // default current month
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown Student';

  // ✅ 当前筛选后的 sessions（按月 & 学生）
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => monthKey(s.date) === selectedMonth)
      .filter(s => (selectedStudentId === 'ALL' ? true : s.studentId === selectedStudentId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, selectedMonth, selectedStudentId]);

  // ✅ 当前筛选后的总小时
  const totalHours = useMemo(() => {
    return filteredSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  }, [filteredSessions]);

  // ✅ 可选：每月汇总（用于你以后想做“每个月一览表”）
  const monthlySummaryByStudent = useMemo(() => {
    // month -> studentId -> hours
    const map = new Map<string, Map<string, number>>();
    for (const s of sessions) {
      const m = monthKey(s.date);
      if (!map.has(m)) map.set(m, new Map());
      const inner = map.get(m)!;
      inner.set(s.studentId, (inner.get(s.studentId) || 0) + (Number(s.duration) || 0));
    }
    return map;
  }, [sessions]);

  // 当前月份下：各学生总小时（可在 UI 里展示）
  const currentMonthAllStudents = useMemo(() => {
    const inner = monthlySummaryByStudent.get(selectedMonth);
    if (!inner) return [];
    const arr = Array.from(inner.entries()).map(([studentId, hours]) => ({
      studentId,
      hours
    }));
    // sort desc
    arr.sort((a, b) => b.hours - a.hours);
    return arr;
  }, [monthlySummaryByStudent, selectedMonth]);

  return (
    <div className="space-y-4">
      {/* 顶部筛选器 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Student filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
            >
              <option value="ALL">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Month filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 总小时卡片（当前筛选条件） */}
      <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg shadow-rose-200">
        <p className="text-rose-100 text-sm">
          Total Hours in {selectedMonth}
          {selectedStudentId === 'ALL' ? '' : ` · ${getStudentName(selectedStudentId)}`}
        </p>
        <p className="text-3xl font-bold">{totalHours} hrs</p>
      </div>

      {/* 可选：当月各学生汇总（你如果觉得多余我也可以删掉） */}
      {selectedStudentId === 'ALL' && currentMonthAllStudents.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Monthly Summary (All Students)</h2>
          <div className="space-y-2">
            {currentMonthAllStudents.map(item => (
              <div key={item.studentId} className="flex justify-between text-sm">
                <span className="text-gray-700">{getStudentName(item.studentId)}</span>
                <span className="text-gray-900 font-medium">{item.hours} hrs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 明细列表 */}
      <h2 className="text-lg font-bold text-gray-800 mb-2">Class History</h2>

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No classes recorded for this filter.
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