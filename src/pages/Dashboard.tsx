import React, { useMemo, useState } from 'react';
import { useStudentData } from '../context/StudentContext';
import Select from '../components/Select';
import { isPackageFolder, previewPackagePosition } from '../lib/package';

// ✅ folder 显示名（只影响 UI，不影响数据）
const FOLDER_LABELS: Record<string, string> = {
  "1": "在外授课记录",
  "2": "Kylie的学习记录",
  "3": "课包记录",
  "4": "在外私课",
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
  // ✅ 这里要拿到 sessions，才能算 packageNo
  const { students, sessions, addClassSession } = useStudentData();

  // ✅ 选择记录分组（默认 1：授课记录）
  const [folder, setFolder] = useState<string>("1");

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [classDate, setClassDate] = useState(getTodayInLA());
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState('');

  const classDateLabel = useMemo(() => weekdayLabel(classDate, 'en-US'), [classDate]);

  // ✅ 实时预览：如果当前选择是学习/课包记录，按日期算出会落在第几包第几条
  const packagePreview = useMemo(() => {
    if (!selectedStudentId) return undefined;
    return previewPackagePosition(sessions as any[], folder, selectedStudentId, classDate);
  }, [sessions, folder, selectedStudentId, classDate]);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    await addClassSession(folder, selectedStudentId, classDate, duration, note);

    setSelectedStudentId('');
    setDuration(1);
    setNote('');
    alert('Class logged successfully!');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        <section className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/60">
          <h2 className="text-lg font-semibold text-rose-600 mb-4">
            💃 Quick Log Class
          </h2>

          <form onSubmit={handleQuickLog} className="space-y-4">

            {/* Folder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                记录类型
              </label>
              <Select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="1">{FOLDER_LABELS["1"]}</option>
                <option value="2">{FOLDER_LABELS["2"]}</option>
                <option value="3">{FOLDER_LABELS["3"]}</option>
                <option value="4">{FOLDER_LABELS["4"]}</option>
              </Select>
            </div>

            {/* Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <Select
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
              </Select>

              {/* ✅ 仅 folder=2/3 时显示预览：按日期算出的 Package + 包内第几条 */}
              {selectedStudentId && isPackageFolder(folder) && packagePreview && (
                <p className="mt-1 text-xs text-gray-500">
                  将记录到：<span className="font-semibold">Package {packagePreview.packageNo} · #{packagePreview.ordinal}</span>
                  <span className="ml-1 text-gray-400">
                    （按上课日期排序，每 10 条一包）
                  </span>
                </p>
              )}
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
                className="block w-full min-w-0 max-w-full box-border overflow-hidden p-3 text-sm bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
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

        <section className="bg-white/60 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/60 text-center text-gray-600">
          No recent activity yet.
        </section>

      </div>
    </div>
  );
};

export default Dashboard;