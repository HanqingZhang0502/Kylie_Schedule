import type { ScheduleColor } from '../types';

// 点击循环顺序：无色 → 粉 → 紫 → 蓝 → 黄 → 无色…
export const COLOR_CYCLE: (ScheduleColor | null)[] = [null, 'rose', 'violet', 'sky', 'amber'];

export const COLOR_BADGE: Record<ScheduleColor, string> = {
  rose: 'bg-rose-100 text-rose-700 border-rose-300',
  violet: 'bg-violet-100 text-violet-700 border-violet-300',
  sky: 'bg-sky-100 text-sky-700 border-sky-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
};

export const COLOR_DOT: Record<ScheduleColor, string> = {
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  sky: 'bg-sky-400',
  amber: 'bg-amber-400',
};
