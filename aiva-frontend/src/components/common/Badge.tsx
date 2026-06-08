import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'new'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-navy-700 text-indigo-300 border border-(--border-color)',
  success: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30',
  warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/30',
  danger:  'bg-red-900/30 text-red-400 border border-red-800/30',
  info:    'bg-indigo-900/30 text-indigo-300 border border-indigo-800/30',
  new:     'bg-linear-to-r from-indigo-600 to-violet-600 text-white',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${variantStyles[variant]} ${className}`}>
    {children}
  </span>
)

export default Badge
