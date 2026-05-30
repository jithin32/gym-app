import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { warmupsApi } from '../../services/api';
import { Flame, ChevronDown } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Warmup {
  id: number;
  day_type: string;
  title: string;
  duration: string;
  instructions: string;
}

const DAY_TYPES = [
  { value: 'chest', label: 'Chest Day' },
  { value: 'back', label: 'Back Day' },
  { value: 'legs', label: 'Legs Day' },
  { value: 'shoulder', label: 'Shoulder Day' },
  { value: 'biceps', label: 'Biceps Day' },
  { value: 'triceps', label: 'Triceps Day' },
  { value: 'full_body', label: 'Full Body' },
];

export default function WarmupPage() {
  const navigate = useNavigate();
  const [dayType, setDayType] = useState('chest');
  const [warmups, setWarmups] = useState<Warmup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    warmupsApi.byDay(dayType)
      .then((res) => setWarmups(res.data))
      .finally(() => setLoading(false));
  }, [dayType]);

  return (
    <div className="p-5">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Flame className="w-7 h-7 text-orange-400" />
        </div>
        <h1 className="text-white text-xl font-bold">Warm-Up Time</h1>
        <p className="text-gray-400 text-sm mt-1">Complete these before your workout</p>
      </div>

      {/* Day selector */}
      <div className="relative mb-5">
        <select
          value={dayType}
          onChange={(e) => setDayType(e.target.value)}
          className="w-full appearance-none bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {DAY_TYPES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Warmup cards */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3 mb-6">
          {warmups.map((w, i) => (
            <div key={w.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-white font-semibold">{w.title}</h3>
                </div>
                <span className="text-orange-400 text-xs font-medium bg-orange-900/30 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  {w.duration}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed ml-8">{w.instructions}</p>
            </div>
          ))}

          {warmups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No warm-ups found for this day type
            </div>
          )}
        </div>
      )}

      <Button onClick={() => navigate('/member/workout')} className="w-full py-3" size="lg">
        Continue to Workout →
      </Button>
    </div>
  );
}
