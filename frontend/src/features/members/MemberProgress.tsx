import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMeasurements, type Measurement } from '../measurements/measurementsSlice';
import MeasurementForm from '../measurements/MeasurementForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Plus, TrendingUp, TrendingDown, Minus, Activity, Dumbbell } from 'lucide-react';
import { plansApi } from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';

const tick = { fontSize: 10, fill: '#9ca3af' };
const tooltipStyle = { contentStyle: { background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 } };

function MiniChart({ data, lines, title }: {
  data: Record<string, string | number | null>[];
  lines: { key: string; color: string }[];
  title: string;
}) {
  if (data.length < 2) return null;
  return (
    <div>
      <p className="text-gray-400 text-xs font-medium mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={tick} />
          <YAxis tick={tick} width={28} />
          <Tooltip {...tooltipStyle} />
          {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />}
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color}
              strokeWidth={2} dot={{ r: 3, fill: l.color }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WorkoutStats {
  total_workouts: string; total_minutes: string;
  today_workouts: string; today_minutes: string;
  week_workouts: string; week_minutes: string;
  month_workouts: string; month_minutes: string;
  year_workouts: string; year_minutes: string;
}

function fmtTime(minutes: number) {
  if (minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getDiff(latest: Measurement, prev: Measurement | undefined, key: keyof Measurement): number | null {
  if (!prev) return null;
  const a = Number(latest[key]);
  const b = Number(prev[key]);
  if (!a || !b) return null;
  return parseFloat((a - b).toFixed(1));
}

export default function MemberProgress() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { records, loading } = useAppSelector((s) => s.measurements);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'overview' | 'history'>('overview');
  const [stats, setStats] = useState<WorkoutStats | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchMeasurements(user.id));
      plansApi.workoutStats(user.id).then((r) => setStats(r.data)).catch(() => {});
    }
  }, [dispatch, user]);

  if (!user) return null;

  const latest = records[0];
  const prev = records[1];

  const chartData = [...records].reverse().map((r) => ({
    date: new Date(r.recorded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    Weight: r.weight_kg ? Number(r.weight_kg) : null,
    'Body Fat %': r.body_fat_pct ? Number(r.body_fat_pct) : null,
    Chest: r.chest_cm ? Number(r.chest_cm) : null,
    Waist: r.waist_cm ? Number(r.waist_cm) : null,
    'L. Bicep': r.bicep_left_cm ? Number(r.bicep_left_cm) : null,
    'R. Bicep': r.bicep_right_cm ? Number(r.bicep_right_cm) : null,
  }));

  const statItems = latest ? [
    { label: 'Weight', value: latest.weight_kg, unit: 'kg', key: 'weight_kg' as keyof Measurement, lower: false },
    { label: 'Body Fat', value: latest.body_fat_pct, unit: '%', key: 'body_fat_pct' as keyof Measurement, lower: true },
    { label: 'Chest', value: latest.chest_cm, unit: 'cm', key: 'chest_cm' as keyof Measurement, lower: false },
    { label: 'Waist', value: latest.waist_cm, unit: 'cm', key: 'waist_cm' as keyof Measurement, lower: true },
  ] : [];

  const workoutCols = stats ? [
    { label: 'Today', w: stats.today_workouts, m: stats.today_minutes },
    { label: 'Week', w: stats.week_workouts, m: stats.week_minutes },
    { label: 'Month', w: stats.month_workouts, m: stats.month_minutes },
    { label: 'Year', w: stats.year_workouts, m: stats.year_minutes },
  ] : [];

  return (
    <div className="p-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white text-xl font-bold">My Progress</h1>
          <p className="text-gray-400 text-xs mt-0.5">Body measurements & workout history</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Log Entry
        </Button>
      </div>

      {/* Workout Stats strip */}
      {stats && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-primary-400" />
            <span className="text-white font-semibold text-sm">Workout Activity</span>
            <span className="ml-auto text-gray-500 text-xs">
              {stats.total_workouts} total · {fmtTime(parseInt(stats.total_minutes))}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {workoutCols.map(({ label, w, m }) => (
              <div key={label} className="bg-gray-700/60 rounded-xl p-2.5 text-center">
                <p className="text-gray-500 text-[10px] mb-1">{label}</p>
                <p className="text-white text-sm font-bold leading-tight">{fmtTime(parseInt(m))}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{w} session{parseInt(w) !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 mb-5 w-fit">
        {(['overview', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t === 'overview' ? 'Overview' : 'History'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">No measurements yet</h2>
          <p className="text-gray-400 text-sm mb-4">Log your first entry to start tracking growth</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Log First Entry</Button>
        </div>
      ) : tab === 'overview' ? (
        <>
          {/* Latest snapshot */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {statItems.map(({ label, value, unit, key, lower }) => {
              const d = getDiff(latest, prev, key);
              const isGood = d === null ? null : lower ? d < 0 : d > 0;
              const Icon = d === null || d === 0 ? Minus : isGood ? TrendingUp : TrendingDown;
              const color = d === null || d === 0 ? 'text-gray-500' : isGood ? 'text-green-400' : 'text-red-400';
              return (
                <div key={label} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-white text-2xl font-bold">
                    {value != null ? Number(value) : '—'}
                    {value != null && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
                  </p>
                  {d !== null && (
                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{d > 0 ? '+' : ''}{d}{unit} vs last</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Charts */}
          {chartData.length < 2 ? (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 text-center">
              <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Log one more entry to see progress charts</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-6">
              <MiniChart title="Weight (kg)" data={chartData} lines={[{ key: 'Weight', color: '#dc2626' }]} />
              <MiniChart title="Body Fat %" data={chartData} lines={[{ key: 'Body Fat %', color: '#f59e0b' }]} />
              <MiniChart title="Chest & Waist (cm)" data={chartData} lines={[{ key: 'Chest', color: '#10b981' }, { key: 'Waist', color: '#ef4444' }]} />
              <MiniChart title="Biceps (cm)" data={chartData} lines={[{ key: 'L. Bicep', color: '#8b5cf6' }, { key: 'R. Bicep', color: '#06b6d4' }]} />
            </div>
          )}
        </>
      ) : (
        /* History tab — compact table */
        <div className="overflow-x-auto rounded-2xl border border-gray-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700 text-left">
                {['Date', 'Weight', 'Body Fat', 'Chest', 'Waist', 'L.Bicep', 'R.Bicep', 'Height', 'By'].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-800 ${i % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-800/60'}`}>
                  <td className="px-3 py-2.5 text-gray-200 font-medium whitespace-nowrap">
                    {new Date(r.recorded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.weight_kg != null ? `${r.weight_kg}kg` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.body_fat_pct != null ? `${r.body_fat_pct}%` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.chest_cm != null ? `${r.chest_cm}cm` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.waist_cm != null ? `${r.waist_cm}cm` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.bicep_left_cm != null ? `${r.bicep_left_cm}cm` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.bicep_right_cm != null ? `${r.bicep_right_cm}cm` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{r.height_cm != null ? `${r.height_cm}cm` : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.recorded_by_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Measurements">
        <MeasurementForm memberId={user.id} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
