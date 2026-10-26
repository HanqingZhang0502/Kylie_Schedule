import React from 'react';
import { ChevronDown } from 'lucide-react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

// 原生 <select> 会被浏览器套上系统外观，忽略大部分自定义样式；
// 这里用 appearance-none 关掉系统外观，自己画一个箭头图标来统一观感。
const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </select>
    <ChevronDown
      size={18}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
    />
  </div>
);

export default Select;
