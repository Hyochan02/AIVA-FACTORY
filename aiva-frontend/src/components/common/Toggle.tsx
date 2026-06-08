import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{ width: 40, height: 22 }}
      className={`rounded-full relative shrink-0 transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-indigo-600" : "bg-slate-600"}`}
    >
      <span
        className="absolute w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? 20 : 4, transform: "translateY(-50%)" }}
      />
    </button>
  );
};

export default Toggle;
