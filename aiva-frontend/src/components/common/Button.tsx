import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ──────────────────────────────────────────────────────────
// Best Practice: 변형(variant)별 스타일을 맵으로 관리
// → 추후 새 variant 추가 시 하나의 객체만 수정하면 OK
// ──────────────────────────────────────────────────────────
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/40",
  secondary:
    "bg-navy-800 hover:bg-navy-700 text-indigo-300 border border-(--border-color)",
  ghost:
    "hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
  soft: "bg-[var(--color-primary-soft)] hover:bg-indigo-900/30 text-indigo-300",
  danger:
    "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/30",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 text-xs font-semibold rounded-[10px]",
  md: "px-4 py-2 text-sm font-semibold rounded-[12px]",
  lg: "px-6 py-3 text-base font-bold rounded-[14px]",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
