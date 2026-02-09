import React, { useMemo, useState } from 'react';
import { useStudentData } from '../context/StudentContext';

// ✅ folder 显示名（只影响 UI，不影响数据）
const FOLDER_LABELS: Record<string, string> = {
  "1": "授课记录",
  "2": "学习记录",
};

// ✅ 获取“洛杉矶今天”的 YYYY-MM-DD，避免晚上变成第二天（UTC bug）
const getTodayInLA = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
};

// ✅ 把 YYYY-MM-DD 转成：周几 + 友好日期（用于显示）
const weekdayLabel = (ymd: string, locale = 'en-US') => {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  const dt = new Date(y, mo - 1, d);

  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dt);
  const pretty = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
  return `${weekday}, ${pretty}`;
};

const Dashboard: React.FC = () => {
  const { students, addClassSession } = useStudentData();

  // ✅ NEW: 选择记录分组（默认 1：授课记录）
  const [folder, setFolder] = useState<string>("1");

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [classDate, setClassDate] = useState(getTodayInLA());
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState('');

  const classDateLabel = useMemo(() => weekdayLabel(classDate, 'en-US'), [classDate]);

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    // ✅ CHANGED: new signature addClassSession(folder, studentId, ...)
    addClassSession(folder, selectedStudentId, classDate, duration, note);

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
      <div className="min-h-screen w-full bg-white/20 backdrop-blur-[2px]">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

          <section className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/40">
            <h2 className="text-lg font-semibold text-rose-600 mb-4">
              💃 Quick Log Class
            </h2>

            <form onSubmit={handleQuickLog} className="space-y-4">

              {/* ✅ NEW: Folder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  记录类型
                </label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="1">{FOLDER_LABELS["1"]}</option>
                  <option value="2">{FOLDER_LABELS["2"]}</option>
                </select>
              </div>

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

              <button
                type="submit"
                disabled={!selectedStudentId}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-rose-300 active:scale-95 transition-all disabled:opacity-50"
              >
                Log Class
              </button>
            </form>
          </section>

          <section className="bg-white/50 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/40 text-center text-gray-600">
            No recent activity yet.
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;