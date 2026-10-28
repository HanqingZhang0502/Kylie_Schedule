import type { ScheduleColor } from '../types';

// 点击循环顺序：无色 → 粉 → 紫 → 蓝 → 黄 → 绿 → 靛 → 灰 → 无色…
export const COLOR_CYCLE: (ScheduleColor | null)[] = [
  null, 'rose', 'violet', 'sky', 'amber', 'emerald', 'indigo', 'slate',
];

export const COLOR_BADGE: Record<ScheduleColor, string> = {
  rose: 'bg-rose-100 text-rose-700 border-rose-300',
  violet: 'bg-violet-100 text-violet-700 border-violet-300',
  sky: 'bg-sky-100 text-sky-700 border-sky-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  slate: 'bg-slate-200 text-slate-700 border-slate-400',
};

export const COLOR_DOT: Record<ScheduleColor, string> = {
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  sky: 'bg-sky-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  indigo: 'bg-indigo-400',
  slate: 'bg-slate-400',
};
