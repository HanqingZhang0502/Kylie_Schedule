import React, { useEffect, useRef, useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { sketchCard } from '../lib/sketchStyles';

const SAVE_DELAY_MS = 800;

const QuickNotes: React.FC = () => {
  const { quickNote, quickNoteLoaded, saveQuickNote } = useNotes();
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-marker text-2xl font-bold text-ink">随手记</h2>
        {statusLabel && (
          <span className="font-hand text-xs text-ink-muted">{statusLabel}</span>
        )}
      </div>

      <div className={`${sketchCard} p-4`}>
        <textarea
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="想到什么写什么…"
          className="w-full min-h-[60vh] resize-none bg-transparent outline-none font-hand text-lg text-ink leading-relaxed"
        />
      </div>
    </div>
  );
};

export default QuickNotes;
