import React, { useMemo, useState } from 'react';
import { useStudentData } from '../context/StudentContext';

// ✅ 获取“洛杉矶今天”的 YYYY-MM-DD，避免晚上变成第二天（UTC bug）
const getTodayInLA = () => {
  // en-CA 输出格式就是 YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
};

// ✅ 把 YYYY-MM-DD 转成：周几 + 友好日期（用于显示）
const weekdayLabel = (ymd: string, locale = 'en-US') => {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  // 用本地时区的 00:00 构造日期，稳定不会被 UTC 搞乱
  const dt = new Date(y, mo - 1, d);

  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dt); // Monday
  const pretty = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt); // Feb 9, 2026
  return `${weekday}, ${pretty}`;
};

const Dashboard: React.FC = () => {
  const { students, addClassSession } = useStudentData();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  // ✅ 修复：不要用 toISOString()（UTC），改用洛杉矶“本地今天”
  const [classDate, setClassDate] = useState(getTodayInLA());
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState('');

  // ✅ 选择日期后，周几会实时跟着变
  const classDateLabel = useMemo(() => weekdayLabel(classDate, 'en-US'), [classDate]);

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    addClassSession(selectedStudentId, classDate, duration, note);

    setSelectedStudentId('');
    setDuration(1);
    setNote('');
    alert('Class logged successfully!');
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-dance.png')" }}
    >
      {/* 背景蒙版（防止太花） */}
      <div className="min-h-screen w-full bg-white/20 backdrop-blur-[2px]">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

          {/* Quick Log Card */}
          <section className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/40">
            <h2 className="text-lg font-semibold text-rose-600 mb-4">
              💃 Quick Log Class
            </h2>

            <form onSubmit={handleQuickLog} className="space-y-4">
              {/* Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Date
                </label>
                <input
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
                {/* ✅ 显示周几（input 本身不能显示周几，所以用提示文本） */}
                {classDateLabel && (
                  <p className="mt-1 text-xs text-gray-500">
                    {classDateLabel}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Rumba Basics"
                  className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={!selectedStudentId}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-rose-300 active:scale-95 transition-all disabled:opacity-50"
              >
                Log Class
              </button>
            </form>
          </section>

          {/* Recent Activity */}
          <section className="bg-white/50 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/40 text-center text-gray-600">
            No recent activity yet.
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;