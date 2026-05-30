import { useEffect, useState } from 'react';
import { reportsApi } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface HeatmapEntry { date: string; count: string; }
interface GrowthEntry { month: string; label: string; count: string; }
interface WorkoutEntry { label: string; count: string; }

function AttendanceHeatmap({ data }: { data: HeatmapEntry[] }) {
  const map: Record<string, number> = {};
  data.forEach((d) => { map[d.date] = parseInt(d.count); });

  const days: { date: string; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map[key] ?? 0 });
  }

  const max = Math.max(...days.map((d) => d.count), 1);

  const intensity = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    const ratio = count / max;
    if (ratio < 0.25) return 'bg-primary-200';
    if (ratio < 0.5) return 'bg-primary-400';
    if (ratio < 0.75) return 'bg-primary-600';
    return 'bg-primary-700';
  };

  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} check-ins`}
                className={`w-4 h-4 rounded-sm ${intensity(day.count)} cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        {['bg-gray-100','bg-primary-200','bg-primary-400','bg-primary-600','bg-primary-700'].map((c, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [growth, setGrowth] = useState<GrowthEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.heatmap(),
      reportsApi.memberGrowth(),
      reportsApi.workoutStats(),
    ]).then(([h, g, w]) => {
      setHeatmap(h.data);
      setGrowth(g.data);
      setWorkouts(w.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading reports...</div>;

  const growthChartData = growth.map((g) => ({ name: g.label, members: parseInt(g.count) }));
  const workoutChartData = workouts.map((w) => ({ name: w.label, workouts: parseInt(w.count) }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analytics and insights for your gym</p>
      </div>

      {/* Attendance Heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Attendance Heatmap</h2>
        <p className="text-xs text-gray-500 mb-4">Daily check-ins over the last 90 days</p>
        <AttendanceHeatmap data={heatmap} />
      </div>

      {/* Member Growth */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Member Growth</h2>
        <p className="text-xs text-gray-500 mb-4">New members joined per month (last 12 months)</p>
        {growthChartData.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="members" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Workout Completions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Workout Completions</h2>
        <p className="text-xs text-gray-500 mb-4">Workouts marked complete per month (last 6 months)</p>
        {workoutChartData.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No completions recorded yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workoutChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="workouts" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
