import React, { useMemo, useState, useEffect } from 'react';
import { useStudentData } from '../context/StudentContext';
import { Trash2, Pencil } from 'lucide-react';
import Select from '../components/Select';
import { isPackageFolder, computePackagePositions, previewPackagePosition } from '../lib/package';
import { sketchInput, sketchCard, sketchBtnPrimary, sketchBtnSecondary } from '../lib/sketchStyles';

const monthKey = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM

const FOLDER_LABELS: Record<string, string> = {
  "1": "在外授课记录",
  "2": "Kylie的学习记录",
  "3": "课包记录",
  "4": "在外私课",
};

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

const ALL_TIME_VALUE = 'ALL_TIME';

const History: React.FC = () => {
  const { sessions, students, deleteClassSession, deleteClassSessions, updateClassSession } = useStudentData();

  const [selectedFolder, setSelectedFolder] = useState<string>('1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');

  // ✅ Month 增加 All Time
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_TIME_VALUE);

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
    return sessions.filter((s: any) => (s.folder ?? '1') === selectedFolder);
  }, [sessions, selectedFolder]);

  // ✅ 给每条 session 现算出 Package 几 + 包内第几条（按日期排序，不读任何存储字段）
  // 注意：用 folderSessions（不受月份筛选影响），这样跨月也不会把编号打乱
  const packagePositions = useMemo(() => {
    if (!isPackageFolder(selectedFolder)) return new Map<string, { packageNo: number; ordinal: number }>();
    return computePackagePositions(folderSessions as any[]);
  }, [folderSessions, selectedFolder]);

  /* ✅ 从“当前 folderSessions”里自动生成可选月份 + All Time */
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    folderSessions.forEach((s: any) => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.slice(0, 7));
      }
    });

    const months = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
    // ✅ 把 All Time 放在最前面
    return [ALL_TIME_VALUE, ...months];
  }, [folderSessions]);

  /* ✅ 默认 Month：如果当前选择不在列表里，重置为 All Time */
  useEffect(() => {
    if (availableMonths.length === 0) {
      setSelectedMonth(ALL_TIME_VALUE);
      return;
    }
    if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(ALL_TIME_VALUE);
    }
  }, [availableMonths, selectedMonth]);

  /* ✅ 根据 folder + 学生 + Month(All Time) 筛选 */
  const filteredSessions = useMemo(() => {
    const base = folderSessions
      .filter((s: any) => (selectedStudentId === 'ALL' ? true : s.studentId === selectedStudentId));

    // ✅ All Time：不过滤月份
    if (selectedMonth === ALL_TIME_VALUE) {
      return [...base].sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
    }

    // ✅ 按月过滤
    return base
      .filter((s: any) => monthKey(s.date) === selectedMonth)
      .sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
  }, [folderSessions, selectedMonth, selectedStudentId]);

  /* ✅ 当前筛选条件下的总课时 */
  const totalHours = useMemo(() => {
    return filteredSessions.reduce((acc: number, s: any) => acc + (Number(s.duration) || 0), 0);
  }, [filteredSessions]);

  // ✅ 当筛选条件变化时，把不在当前列表里的勾选项清掉（避免误删）
  useEffect(() => {
    const visible = new Set(filteredSessions.map((s: any) => s.id));
    setSelectedIds(prev => {
      const next = new Set<string>();
      prev.forEach(id => {
        if (visible.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredSessions]);

  const allVisibleIds = useMemo(() => filteredSessions.map((s: any) => s.id), [filteredSessions]);
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
      if (allSelected) return new Set();
      return new Set(allVisibleIds);
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

  // ✅ 编辑弹窗里的实时预览：按当前表单里的类型/学生/日期，算出会落在第几包第几条。
  // Package 编号从不存储，所以这里不需要区分"有没有变"——改日期也会影响排位，
  // 每次都现算就行。
  const editPackagePreview = useMemo(() => {
    if (!editingSessionId) return undefined;
    return previewPackagePosition(
      sessions as any[],
      editForm.folder,
      editForm.studentId,
      editForm.date,
      editingSessionId
    );
  }, [sessions, editForm.folder, editForm.studentId, editForm.date, editingSessionId]);

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
      <div className={`${sketchCard} p-4 space-y-3`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Folder */}
          <div>
            <label className="font-hand block text-sm text-ink mb-1">记录类型</label>
            <Select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className={`w-full ${sketchInput}`}
            >
              <option value="1">{FOLDER_LABELS["1"]}</option>
              <option value="2">{FOLDER_LABELS["2"]}</option>
              <option value="3">{FOLDER_LABELS["3"]}</option>
              <option value="4">{FOLDER_LABELS["4"]}</option>
            </Select>
          </div>

          {/* Student */}
          <div>
            <label className="font-hand block text-sm text-ink mb-1">Student</label>
            <Select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`w-full ${sketchInput}`}
            >
              <option value="ALL">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          {/* Month */}
          <div>
            <label className="font-hand block text-sm text-ink mb-1">Month</label>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full ${sketchInput}`}
              disabled={availableMonths.length === 0}
            >
              {availableMonths.length === 0 ? (
                <option value={ALL_TIME_VALUE}>All Time</option>
              ) : (
                availableMonths.map(m => (
                  <option key={m} value={m}>
                    {m === ALL_TIME_VALUE ? 'All Time' : m}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>

        {/* Bulk action bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="font-hand text-sm text-ink-muted">
            Selected: <span className="font-bold text-ink">{selectedIds.size}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={filteredSessions.length === 0}
              className={`${sketchBtnSecondary} px-3 py-2 disabled:opacity-50`}
            >
              {allSelected ? 'Clear' : 'Select All'}
            </button>

            <button
              type="button"
              onClick={bulkDelete}
              disabled={selectedIds.size === 0}
              className={`${sketchBtnPrimary} px-3 py-2`}
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* 总课时 */}
      <div className="bg-accent text-paper p-4 rounded-sketch shadow-sketch">
        <p className="font-hand text-paper/80 text-sm">
          Total Hours · {selectedMonth === ALL_TIME_VALUE ? 'All Time' : (selectedMonth || '—')} · {FOLDER_LABELS[selectedFolder]}
          {selectedStudentId === 'ALL' ? '' : ` · ${getStudentName(selectedStudentId)}`}
        </p>
        <p className="text-3xl font-bold">{totalHours} hrs</p>
      </div>

      <h2 className="font-marker text-2xl font-bold text-ink mb-2">
        Class History · {FOLDER_LABELS[selectedFolder]}
      </h2>

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="font-hand text-center py-10 text-ink-muted">
            No classes for this selection.
          </div>
        ) : (
          filteredSessions.map((session: any) => {
            const showPkg = isPackageFolder(selectedFolder);
            const pos = showPkg ? packagePositions.get(String(session.id)) : undefined;

            return (
              <div
                key={session.id}
                className={`${sketchCard} p-4 flex justify-between items-start`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(session.id)}
                    onChange={() => toggleOne(session.id)}
                    className="mt-1 h-4 w-4 accent-accent"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-hand text-lg text-ink">
                        {getStudentName(session.studentId)}
                      </h3>

                      {/* ✅ Package X · #Y（仅 folder=2/3） */}
                      {showPkg && pos && (
                        <span className="text-xs bg-highlight text-ink px-2 py-0.5 rounded-sketch-sm border border-line">
                          Package {pos.packageNo} · #{pos.ordinal}
                        </span>
                      )}

                      <span className="text-xs bg-annotation/10 text-annotation px-2 py-0.5 rounded-sketch-sm">
                        {session.duration}h
                      </span>
                    </div>

                    <p className="font-hand text-sm text-ink-muted">{formatWithWeekday(session.date, 'en-US')}</p>

                    {session.note && (
                      <p className="font-hand text-sm text-ink-muted/80 mt-1 italic">"{session.note}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(session)}
                    className="text-line hover:text-annotation p-2"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this record?')) deleteClassSession(session.id);
                    }}
                    className="text-line hover:text-accent p-2"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-ink/40" onClick={closeEdit} />
          <div className={`relative w-full min-w-0 max-w-md ${sketchCard} p-5`}>
            <h3 className="font-marker text-2xl font-bold text-ink mb-4">Edit Class</h3>

            <label className="font-hand block text-sm text-ink mb-1">记录类型</label>
            <Select
              value={editForm.folder}
              onChange={(e) => setEditForm(f => ({ ...f, folder: e.target.value }))}
              className={`w-full mb-3 ${sketchInput}`}
            >
              <option value="1">{FOLDER_LABELS["1"]}</option>
              <option value="2">{FOLDER_LABELS["2"]}</option>
              <option value="3">{FOLDER_LABELS["3"]}</option>
              <option value="4">{FOLDER_LABELS["4"]}</option>
            </Select>

            <label className="font-hand block text-sm text-ink mb-1">Student</label>
            <Select
              value={editForm.studentId}
              onChange={(e) => setEditForm(f => ({ ...f, studentId: e.target.value }))}
              className={`w-full ${sketchInput}`}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>

            {editPackagePreview ? (
              <p className="font-hand mt-1 mb-3 text-xs text-ink-muted">
                按当前日期归入：<span className="font-bold text-accent">Package {editPackagePreview.packageNo} · #{editPackagePreview.ordinal}</span>
                <span className="ml-1 text-ink-muted/70">（按上课日期排序，每 10 条一包）</span>
              </p>
            ) : (
              <div className="mb-3" />
            )}

            <div className="mb-1 flex items-end justify-between">
              <label className="font-hand block text-sm text-ink">Date</label>
              {editDateLabel && <span className="font-hand text-xs text-ink-muted">{editDateLabel}</span>}
            </div>
            <input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))}
              className={`block w-px min-w-full max-w-full box-border overflow-hidden mb-3 ${sketchInput}`}
            />

            <label className="font-hand block text-sm text-ink mb-1">Duration (hours)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={editForm.duration}
              onChange={(e) => setEditForm(f => ({ ...f, duration: e.target.value }))}
              className={`w-full mb-3 ${sketchInput}`}
            />

            <label className="font-hand block text-sm text-ink mb-1">Note</label>
            <input
              type="text"
              value={editForm.note}
              onChange={(e) => setEditForm(f => ({ ...f, note: e.target.value }))}
              className={`w-full mb-5 ${sketchInput}`}
              placeholder="Optional"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeEdit}
                className={`${sketchBtnSecondary} px-4 py-2`}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className={`${sketchBtnPrimary} px-4 py-2`}
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