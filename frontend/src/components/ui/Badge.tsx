interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';
}

const variants: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
};

export default function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'green' },
    frozen: { label: 'Frozen', variant: 'blue' },
    expired: { label: 'Expired', variant: 'red' },
    paid: { label: 'Paid', variant: 'green' },
    pending: { label: 'Pending', variant: 'yellow' },
    overdue: { label: 'Overdue', variant: 'red' },
  };
  const conf = map[status] ?? { label: status, variant: 'gray' as const };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}
