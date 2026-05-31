import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import {
  Users, UserCheck, AlertCircle, TrendingUp,
  Dumbbell, UserPlus, CalendarCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface Stats {
  totalMembers: number;
  activeToday: number;
  pendingFees: number;
  revenueThisMonth: number;
  totalCoaches: number;
  newJoiners: number;
  overduePayments: number;
}

interface Charts {
  attendanceTrend: { date: string; count: string }[];
  revenueChart: { month: string; total: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.adminStats().then((res) => {
      setStats(res.data.stats);
      setCharts(res.data.charts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Today"
          value={stats?.activeToday ?? 0}
          icon={CalendarCheck}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pending Fees"
          value={stats?.pendingFees ?? 0}
          icon={AlertCircle}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Revenue This Month"
          value={`₹${(stats?.revenueThisMonth ?? 0).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          title="Total Coaches"
          value={stats?.totalCoaches ?? 0}
          icon={Dumbbell}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="New Joiners"
          value={stats?.newJoiners ?? 0}
          icon={UserPlus}
          color="bg-teal-100 text-teal-600"
          sub="This month"
        />
        <StatCard
          title="Overdue Payments"
          value={stats?.overduePayments ?? 0}
          icon={AlertCircle}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Active Members"
          value={stats?.totalMembers ?? 0}
          icon={UserCheck}
          color="bg-gray-100 text-gray-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Attendance — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.attendanceTrend.map((d) => ({
              day: d.date ? new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }) : '—',
              count: parseInt(d.count) || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.revenueChart.map((d) => ({
              month: d.month,
              total: parseFloat(d.total) || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
