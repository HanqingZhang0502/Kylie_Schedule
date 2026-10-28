import React, { useEffect, useRef, useState } from 'react';
import { Highlighter, Pencil } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { sketchCard } from '../lib/sketchStyles';
import { COLOR_BADGE, COLOR_CYCLE } from '../lib/colorTags';
import type { ScheduleColor } from '../types';

const SAVE_DELAY_MS = 800;

const QuickNotes: React.FC = () => {
  const { quickNote, quickNoteLoaded, saveQuickNote, quickNoteLineColors, setLineColor } = useNotes();
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');
  const [mode, setMode] = useState<'edit' | 'highlight'>('edit');
  const hasLoadedDraft = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ 远端数据第一次到达时，把它填进文本框（只做一次，避免打字时被远端覆盖）
  useEffect(() => {
    if (quickNoteLoaded && !hasLoadedDraft.current) {
      setDraft(quickNote);
      hasLoadedDraft.current = true;
    }
  }, [quickNoteLoaded, quickNote]);

  const handleChange = (value: string) => {
    setDraft(value);
    setStatus('pending');

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setStatus('saving');
      await saveQuickNote(value);
      setStatus('saved');
    }, SAVE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const statusMessages: Record<typeof status, string> = {
    idle: '',
    pending: '等待保存…',
    saving: '保存中…',
    saved: '已保存',
  };
  const statusLabel = statusMessages[status];

  const cycleColor = (line: string) => {
    if (!line.trim()) return; // 空行不处理
    const current = quickNoteLineColors[line] ?? null;
    const idx = COLOR_CYCLE.indexOf(current);
    const next = COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
    setLineColor(line, next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-marker text-2xl font-bold text-ink">随手记</h2>
        <div className="flex items-center gap-3">
          {mode === 'edit' && statusLabel && (
            <span className="font-hand text-xs text-ink-muted">{statusLabel}</span>
          )}
          <button
            onClick={() => setMode(m => (m === 'edit' ? 'highlight' : 'edit'))}
            className="font-hand flex items-center gap-1 text-sm text-accent border border-line rounded-sketch-sm px-2 py-1 bg-scrap"
          >
            {mode === 'edit' ? <Highlighter size={16} /> : <Pencil size={16} />}
            {mode === 'edit' ? '标色' : '继续写'}
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className={`${sketchCard} p-4`}>
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="想到什么写什么…"
            className="w-full min-h-[60vh] resize-none bg-transparent outline-none font-hand text-lg text-ink leading-relaxed"
          />
        </div>
      ) : (
        <div className={`${sketchCard} p-4 space-y-1`}>
          <p className="font-hand text-xs text-ink-muted mb-2">点一下某一行，循环切换颜色（粉→紫→蓝→黄→无色）</p>
          {draft.split('\n').map((line, idx) => {
            const color = quickNoteLineColors[line] as ScheduleColor | undefined;
            return (
              <div
                key={idx}
                onClick={() => cycleColor(line)}
                className={`font-hand text-base px-2 py-1 rounded-sketch-sm min-h-[1.75rem] whitespace-pre-wrap border ${
                  color ? COLOR_BADGE[color] : 'border-transparent text-ink'
                } ${line.trim() ? 'cursor-pointer' : ''}`}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickNotes;
