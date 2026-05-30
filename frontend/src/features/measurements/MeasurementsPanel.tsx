import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMeasurements, deleteMeasurement, type Measurement } from './measurementsSlice';
import MeasurementForm from './MeasurementForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

interface Props {
  memberId: number;
  memberName: string;
  canEdit?: boolean;
}

export default function MeasurementsPanel({ memberId, memberName, canEdit = false }: Props) {
  const dispatch = useAppDispatch();
  const { records, loading } = useAppSelector((s) => s.measurements);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'history' | 'chart'>('history');

  useEffect(() => {
    dispatch(fetchMeasurements(memberId));
  }, [dispatch, memberId]);

  const chartData = [...records]
    .reverse()
    .map((r) => ({
      date: new Date(r.recorded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      Weight: r.weight_kg ? Number(r.weight_kg) : null,
      'Body Fat %': r.body_fat_pct ? Number(r.body_fat_pct) : null,
      Chest: r.chest_cm ? Number(r.chest_cm) : null,
      Waist: r.waist_cm ? Number(r.waist_cm) : null,
    }));

  const latest = records[0];
  const prev = records[1];

  const diff = (key: keyof Measurement) => {
    if (!latest || !prev) return null;
    const a = Number(latest[key]);
    const b = Number(prev[key]);
    if (!a || !b) return null;
    const d = (a - b).toFixed(1);
    return Number(d) > 0 ? `+${d}` : d;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['history', 'chart'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              {t === 'chart' ? 'Progress Chart' : 'History'}
            </button>
          ))}
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        )}
      </div>

      {/* Latest vs Prev summary */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Weight', value: latest.weight_kg, unit: 'kg', key: 'weight_kg' as keyof Measurement },
            { label: 'Body Fat', value: latest.body_fat_pct, unit: '%', key: 'body_fat_pct' as keyof Measurement },
            { label: 'Chest', value: latest.chest_cm, unit: 'cm', key: 'chest_cm' as keyof Measurement },
            { label: 'Waist', value: latest.waist_cm, unit: 'cm', key: 'waist_cm' as keyof Measurement },
          ].map(({ label, value, unit, key }) => {
            const d = diff(key);
            const isGood = key === 'waist_cm' || key === 'body_fat_pct' ? d && parseFloat(d) < 0 : d && parseFloat(d) > 0;
            return (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {value != null ? `${Number(value)}${unit}` : '—'}
                </p>
                {d && (
                  <p className={`text-xs font-medium mt-0.5 ${isGood ? 'text-green-600' : 'text-red-500'}`}>
                    {d}{unit} vs last
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'chart' ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          {chartData.length < 2 ? (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8 opacity-40" />
              <p>Need at least 2 entries to show progress charts</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-4">Weight & Body Fat Trend</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Weight" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="Body Fat %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm font-semibold text-gray-700 mt-6 mb-4">Body Measurements (cm)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Chest" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="Waist" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No measurements recorded yet</div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(r.recorded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {r.recorded_by_name && <p className="text-xs text-gray-500">by {r.recorded_by_name}</p>}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => dispatch(deleteMeasurement(r.id))}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-sm">
                  {[
                    ['Weight', r.weight_kg, 'kg'],
                    ['Height', r.height_cm, 'cm'],
                    ['Chest', r.chest_cm, 'cm'],
                    ['Waist', r.waist_cm, 'cm'],
                    ['L. Bicep', r.bicep_left_cm, 'cm'],
                    ['R. Bicep', r.bicep_right_cm, 'cm'],
                    ['Body Fat', r.body_fat_pct, '%'],
                  ].map(([label, val, unit]) => (
                    <div key={String(label)} className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="font-semibold text-gray-800">{val != null ? `${Number(val)}${unit}` : '—'}</p>
                    </div>
                  ))}
                </div>
                {r.notes && <p className="text-xs text-gray-500 mt-2 italic">{r.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={`Add Measurements — ${memberName}`}>
        <MeasurementForm memberId={memberId} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
