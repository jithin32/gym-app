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

function StatCard({
  label, value, unit, diff, lowerIsBetter = false,
}: {
  label: string; value: number | null; unit: string; diff: number | null; lowerIsBetter?: boolean;
}) {
  const isGood = diff === null ? null : lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff === null || diff === 0 ? Minus : isGood ? TrendingUp : TrendingDown;
  const color = diff === null || diff === 0 ? 'text-gray-400' : isGood ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">
        {value != null ? `${Number(value)}` : '—'}
        {value != null && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
      {diff !== null && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${color}`}>
          <Icon className="w-3 h-3" />
          <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit} vs last</span>
        </div>
      )}
    </div>
  );
}

const chartTheme = {
  background: 'transparent',
  cartesian: '#374151',
  tick: { fontSize: 10, fill: '#9ca3af' },
  tooltip: { contentStyle: { background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 } },
};

function GrowthChart({
  data, lines, title,
}: {
  data: Record<string, string | number | null>[];
  lines: { key: string; color: string }[];
  title: string;
}) {
  if (data.length < 2) return null;
  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 mb-4">
      <p className="text-white text-sm font-semibold mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.cartesian} />
          <XAxis dataKey="date" tick={chartTheme.tick} />
          <YAxis tick={chartTheme.tick} width={32} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 3, fill: l.color }}
              connectNulls
            />
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

function WorkoutStatsSection({ memberId }: { memberId: number }) {
  const [stats, setStats] = useState<WorkoutStats | null>(null);

  useEffect(() => {
    plansApi.workoutStats(memberId).then((r) => setStats(r.data));
  }, [memberId]);

  if (!stats) return null;

  const cols = [
    { label: 'Today',     workouts: stats.today_workouts, minutes: stats.today_minutes },
    { label: 'This Week', workouts: stats.week_workouts,  minutes: stats.week_minutes },
    { label: 'This Month',workouts: stats.month_workouts, minutes: stats.month_minutes },
    { label: 'This Year', workouts: stats.year_workouts,  minutes: stats.year_minutes },
  ];

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell className="w-4 h-4 text-primary-400" />
        <h2 className="text-white font-semibold text-sm">Workout Stats</h2>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cols.map(({ label, workouts, minutes }) => (
          <div key={label} className="bg-gray-700/50 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">{label}</p>
            <p className="text-white text-base font-bold leading-tight">
              {fmtTime(parseInt(minutes))}
            </p>
            <p className="text-gray-400 text-[10px] mt-0.5">
              {parseInt(workouts)} session{parseInt(workouts) !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
        <span className="text-gray-500 text-xs">All time</span>
        <span className="text-white text-sm font-semibold">
          {fmtTime(parseInt(stats.total_minutes))}
          <span className="text-gray-400 font-normal ml-1">· {stats.total_workouts} sessions</span>
        </span>
      </div>
    </div>
  );
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

  useEffect(() => {
    if (user) dispatch(fetchMeasurements(user.id));
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

  return (
    <div className="p-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-white text-xl font-bold">My Growth</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track your body measurements over time</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Log Entry
        </Button>
      </div>

      <WorkoutStatsSection memberId={user.id} />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading your progress...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">No measurements yet</h2>
          <p className="text-gray-400 text-sm mb-4">Log your first entry to start tracking your growth</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Log First Entry
          </Button>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard label="Weight" value={latest.weight_kg} unit="kg" diff={getDiff(latest, prev, 'weight_kg')} />
            <StatCard label="Body Fat" value={latest.body_fat_pct} unit="%" diff={getDiff(latest, prev, 'body_fat_pct')} lowerIsBetter />
            <StatCard label="Chest" value={latest.chest_cm} unit="cm" diff={getDiff(latest, prev, 'chest_cm')} />
            <StatCard label="Waist" value={latest.waist_cm} unit="cm" diff={getDiff(latest, prev, 'waist_cm')} lowerIsBetter />
          </div>

          {/* Charts */}
          {chartData.length >= 2 ? (
            <>
              <GrowthChart
                title="Weight (kg)"
                data={chartData}
                lines={[{ key: 'Weight', color: '#dc2626' }]}
              />
              <GrowthChart
                title="Body Fat %"
                data={chartData}
                lines={[{ key: 'Body Fat %', color: '#f59e0b' }]}
              />
              <GrowthChart
                title="Chest & Waist (cm)"
                data={chartData}
                lines={[
                  { key: 'Chest', color: '#10b981' },
                  { key: 'Waist', color: '#ef4444' },
                ]}
              />
              <GrowthChart
                title="Biceps (cm)"
                data={chartData}
                lines={[
                  { key: 'L. Bicep', color: '#8b5cf6' },
                  { key: 'R. Bicep', color: '#06b6d4' },
                ]}
              />
            </>
          ) : (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 text-center mb-4">
              <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Log one more entry to see your growth charts</p>
            </div>
          )}

          {/* History */}
          <div className="mb-2">
            <h2 className="text-white font-semibold text-sm mb-3">History</h2>
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                  <p className="text-white font-semibold text-sm mb-2">
                    {new Date(r.recorded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ['Wt', r.weight_kg, 'kg'],
                      ['BF', r.body_fat_pct, '%'],
                      ['Chest', r.chest_cm, 'cm'],
                      ['Waist', r.waist_cm, 'cm'],
                      ['L. Bcp', r.bicep_left_cm, 'cm'],
                      ['R. Bcp', r.bicep_right_cm, 'cm'],
                      ['Ht', r.height_cm, 'cm'],
                    ].map(([label, val, unit]) => (
                      <div key={String(label)} className="bg-gray-700/50 rounded-lg p-2 text-center">
                        <p className="text-gray-500 text-[10px]">{label}</p>
                        <p className="text-white text-xs font-semibold mt-0.5">
                          {val != null ? `${Number(val)}${unit}` : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {r.notes && <p className="text-gray-500 text-xs mt-2 italic">{r.notes}</p>}
                  {r.recorded_by_name && (
                    <p className="text-gray-600 text-xs mt-1">Logged by {r.recorded_by_name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Measurements">
        <MeasurementForm memberId={user.id} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
