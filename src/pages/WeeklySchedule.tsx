import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { WEEKDAYS } from '../types';
import type { WeekDay, ScheduleBlock, ScheduleColor } from '../types';
import { sketchCard, sketchInput, sketchBtnPrimary, sketchBtnSecondary } from '../lib/sketchStyles';
import { COLOR_BADGE, COLOR_DOT } from '../lib/colorTags';

const COLOR_OPTIONS: ScheduleColor[] = ['rose', 'violet', 'sky', 'amber'];

const sortByStart = (a: ScheduleBlock, b: ScheduleBlock) => a.start.localeCompare(b.start);

interface EditForm {
  start: string;
  end: string;
  label: string;
  color: ScheduleColor;
}

const emptyForm: EditForm = { start: '', end: '', label: '', color: 'rose' };

const WeeklySchedule: React.FC = () => {
  const { weeklySchedule, addScheduleBlock, updateScheduleBlock, deleteScheduleBlock } = useNotes();

  const [isOpen, setIsOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<WeekDay | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);

  const openAdd = (day: WeekDay) => {
    setEditingDay(day);
    setEditingBlockId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (day: WeekDay, block: ScheduleBlock) => {
    setEditingDay(day);
    setEditingBlockId(block.id);
    setForm({ start: block.start, end: block.end, label: block.label, color: block.color });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingDay(null);
    setEditingBlockId(null);
  };

  const save = async () => {
    if (!editingDay || !form.start || !form.end || !form.label.trim()) {
      alert('请把时间和内容填完整。');
      return;
    }

    if (editingBlockId) {
      await updateScheduleBlock(editingDay, editingBlockId, form);
    } else {
      await addScheduleBlock(editingDay, form);
    }
    close();
  };

  const remove = async () => {
    if (!editingDay || !editingBlockId) return;
    if (!confirm('删除这条安排？')) return;
    await deleteScheduleBlock(editingDay, editingBlockId);
    close();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-marker text-2xl font-bold text-ink">周常课表</h2>

      {WEEKDAYS.map((day) => {
        const blocks = [...weeklySchedule[day]].sort(sortByStart);

        return (
          <div key={day} className={`${sketchCard} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-marker text-xl text-accent">{day}</h3>
              <button
                onClick={() => openAdd(day)}
                className="text-ink-muted hover:text-accent p-1"
                title={`给${day}加一条`}
              >
                <Plus size={20} />
              </button>
            </div>

            {blocks.length === 0 ? (
              <p className="font-hand text-sm text-ink-muted/70">这天还没排课</p>
            ) : (
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-sketch-sm border ${COLOR_BADGE[block.color]}`}
                  >
                    <div className="min-w-0">
                      <span className="font-hand text-sm font-bold">{block.start}–{block.end}</span>
                      <span className="font-hand text-sm ml-2 break-words">{block.label}</span>
                    </div>
                    <button
                      onClick={() => openEdit(day, block)}
                      className="shrink-0 opacity-70 hover:opacity-100 p-1"
                      title="编辑"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit/Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-ink/40" onClick={close} />
          <div className={`relative w-full min-w-0 max-w-md ${sketchCard} p-5`}>
            <h3 className="font-marker text-2xl font-bold text-ink mb-4">
              {editingBlockId ? '编辑安排' : `给${editingDay}加一条`}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-hand block text-sm text-ink mb-1">开始</label>
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) => setForm(f => ({ ...f, start: e.target.value }))}
                  className={`block w-px min-w-full max-w-full box-border overflow-hidden ${sketchInput}`}
                />
              </div>
              <div>
                <label className="font-hand block text-sm text-ink mb-1">结束</label>
                <input
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm(f => ({ ...f, end: e.target.value }))}
                  className={`block w-px min-w-full max-w-full box-border overflow-hidden ${sketchInput}`}
                />
              </div>
            </div>

            <label className="font-hand block text-sm text-ink mb-1">内容</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="例如：Ziyi / 启蒙班 / 成人大课"
              className={`w-full mb-3 ${sketchInput}`}
            />

            <label className="font-hand block text-sm text-ink mb-1">颜色标签</label>
            <div className="flex gap-2 mb-5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full ${COLOR_DOT[c]} ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-ink' : ''
                  }`}
                  aria-label={c}
                />
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              {editingBlockId && (
                <button
                  onClick={remove}
                  className="mr-auto text-accent hover:text-accent/80 p-2"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={close} className={`${sketchBtnSecondary} px-4 py-2`}>
                Cancel
              </button>
              <button onClick={save} className={`${sketchBtnPrimary} px-4 py-2`}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;
