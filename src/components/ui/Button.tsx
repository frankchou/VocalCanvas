// Button primitive — 待全端工程師依照設計稿完整實作
// 設計稿參考: .claude/skills/vocalcanvas-design/ui_kits/vocalcanvas-app/components/Primitives.jsx
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  );
}
