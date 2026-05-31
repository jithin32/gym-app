import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  sub?: string;
}

export default function StatCard({ title, value, icon: Icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100 flex items-start gap-3 md:gap-4">
      <div className={`flex-shrink-0 w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-gray-500 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
