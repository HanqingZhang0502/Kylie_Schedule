import React, { useMemo, useState, useEffect } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2, Pencil } from 'lucide-react';

const monthKey = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM

// ✅ folder 显示名（只影响 UI，不影响数据）
const FOLDER_LABELS: Record<string, string> = {
  "1": "授课记录",
  "2": "学习记录",
  "3": "课包记录",
};

// ✅ 显示：周几 + YYYY-MM-DD（稳定，不走 UTC）
const formatWithWeekday = (ymd: string, locale: string = 'en-US') => {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  const dt = new Date(y, mo - 1, d);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dt); // Mon
  return `${weekday} ${ymd}`;
};

const History: React.FC = () => {
  // ✅ add deleteClassSessions for bulk delete
  const { sessions, students, deleteClassSession, deleteClassSessions, updateClassSession } = useStudentData();

  const [selectedFolder, setSelectedFolder] = useState<string>('1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // ✅ bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ====== Edit Modal State ======
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    studentId: string;
    date: string;
    duration: string;
    note: string;
    folder: string;
  }>({
    studentId: '',
    date: '',
    duration: '',
    note: '',
    folder: '1',
  });

  const getStudentName = (id: string) =>
    students.find(s => s.id === id)?.name || 'Unknown Student';

  // ✅ 先按 folder 分组（旧数据没 folder 的默认算 1）
  const folderSessions = useMemo(() => {
    return sessions.filter(s => (s.folder ?? '1') === selectedFolder);
  }, [sessions, selectedFolder]);

  /* ✅ 从“当前 folderSessions”里自动生成可选月份 */
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    folderSessions.forEach(s => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [folderSessions]);

  /* ✅ 默认选最新月份（当 folder 切换时也会重新设定） */
  useEffect(() => {
    if (availableMonths.length === 0) {
      setSelectedMonth('');
      return;
    }
    if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  /* ✅ 根据 folder + 学生 + 月份筛选 */
  const filteredSessions = useMemo(() => {
    if (!selectedMonth) return [];

    return folderSessions
      .filter(s => monthKey(s.date) === selectedMonth)
      .filter(s => (selectedStudentId === 'ALL' ? true : s.studentId === selectedStudentId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [folderSessions, selectedMonth, selectedStudentId]);

  /* ✅ 当前筛选条件下的总课时 */
  const totalHours = useMemo(() => {
    return filteredSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  }, [filteredSessions]);

  // ✅ 当筛选条件变化时，把不在当前列表里的勾选项清掉（避免误删）
  useEffect(() => {
    const visible = new Set(filteredSessions.map(s => s.id));
    setSelectedIds(prev => {
      const next = new Set<string>();
      prev.forEach(id => {
        if (visible.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredSessions]);

  // ✅ bulk helpers
  const allVisibleIds = useMemo(() => filteredSessions.map(s => s.id), [filteredSessions]);
  const allSelected = useMemo(
    () => allVisibleIds.length > 0 && selectedIds.size === allVisibleIds.length,
    [allVisibleIds, selectedIds]
  );

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(() => {
      if (allSelected) return new Set();       // clear
      return new Set(allVisibleIds);           // select all visible
    });
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;

    const ok = confirm(`Delete ${count} selected record(s)? This cannot be undone.`);
    if (!ok) return;

    await deleteClassSessions(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  // ====== Edit Handlers ======
  const openEdit = (session: any) => {
    setEditingSessionId(session.id);
    setEditForm({
      studentId: session.studentId,
      date: session.date,
      duration: String(session.duration ?? ''),
      note: session.note ?? '',
      folder: session.folder ?? '1',
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingSessionId(null);
  };

  const saveEdit = async () => {
    if (!editingSessionId) return;

    const dur = Number(editForm.duration);
    if (!editForm.date || Number.isNaN(dur) || dur <= 0) {
      alert('Please enter a valid date and duration.');
      return;
    }

    await updateClassSession(editingSessionId, {
      studentId: editForm.studentId,
      date: editForm.date,
      duration: dur,
      note: editForm.note?.trim() || '',
      folder: editForm.folder || '1',
    });

    closeEdit();
  };

  const editDateLabel = useMemo(() => {
    return editForm.date ? formatWithWeekday(editForm.date, 'en-US') : '';
  }, [editForm.date]);

  return (
    <div className="space-y-4">
      {/* 筛选器 + 批量操作 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">记录类型</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="1">{FOLDER_LABELS["1"]}</option>
              <option value="2">{FOLDER_LABELS["2"]}</option>
              <option value="3">{FOLDER_LABELS["3"]}</option>
            </select>
          </div>

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

          {/* Month */}
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

        {/* Bulk action bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-500">
            Selected: <span className="font-semibold">{selectedIds.size}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={filteredSessions.length === 0}
              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {allSelected ? 'Clear' : 'Select All'}
            </button>

            <button
              type="button"
              onClick={bulkDelete}
              disabled={selectedIds.size === 0}
              className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* 总课时 */}
      <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg shadow-rose-200">
        <p className="text-rose-100 text-sm">
          Total Hours · {selectedMonth || '—'} · {FOLDER_LABELS[selectedFolder]}
          {selectedStudentId === 'ALL' ? '' : ` · ${getStudentName(selectedStudentId)}`}
        </p>
        <p className="text-3xl font-bold">{totalHours} hrs</p>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-2">
        Class History · {FOLDER_LABELS[selectedFolder]}
      </h2>

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
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(session.id)}
                  onChange={() => toggleOne(session.id)}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      {getStudentName(session.studentId)}
                    </h3>
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {session.duration}h
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">{formatWithWeekday(session.date, 'en-US')}</p>

                  {session.note && (
                    <p className="text-sm text-gray-400 mt-1 italic">"{session.note}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(session)}
                  className="text-gray-300 hover:text-gray-700 p-2"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>

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
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Class</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={editForm.studentId}
              onChange={(e) => setEditForm(f => ({ ...f, studentId: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none mb-3"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div className="mb-1 flex items-end justify-between">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              {editDateLabel && <span className="text-xs text-gray-400">{editDateLabel}</span>}
            </div>
            <input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={editForm.duration}
              onChange={(e) => setEditForm(f => ({ ...f, duration: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              type="text"
              value={editForm.note}
              onChange={(e) => setEditForm(f => ({ ...f, note: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none mb-5"
              placeholder="Optional"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeEdit}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;