// 手绘便签风共用样式片段，直接当 className 用（不走 @apply，避开那条有问题的编译路径）。

// 注意：不含宽度类（w-full 等），由调用方自己加——日期输入框那种有宽度溢出问题的
// 场景要用 w-px min-w-full 而不是 w-full，混进同一个字符串常量里会因为 Tailwind
// 生成的 CSS 顺序而被 w-full 覆盖掉，所以把宽度留给调用方决定。
export const sketchInput =
  'p-3 bg-paper border border-line rounded-sketch text-ink outline-none ' +
  'focus:outline focus:outline-2 focus:outline-dashed focus:outline-offset-2 focus:outline-[#344c69]';

export const sketchCard = 'bg-scrap border border-line rounded-sketch shadow-sketch';

export const sketchBtnPrimary =
  'sketch-btn-primary bg-accent text-paper font-hand text-lg rounded-sketch shadow-sketch ' +
  'border border-accent transition-transform duration-100 ' +
  'hover:-rotate-1 active:rotate-0 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ' +
  'disabled:opacity-50 disabled:hover:rotate-0 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-2 focus-visible:outline-[#344c69]';

export const sketchBtnSecondary =
  'sketch-btn-secondary bg-paper text-ink font-hand rounded-sketch border border-line shadow-sketch-sm ' +
  'transition-transform duration-100 ' +
  'hover:-rotate-1 active:rotate-0 active:shadow-none active:translate-x-px active:translate-y-px ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-2 focus-visible:outline-[#344c69]';
