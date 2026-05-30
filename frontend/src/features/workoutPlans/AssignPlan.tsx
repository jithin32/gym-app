import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { assignPlan } from './plansSlice';
import { fetchMembers } from '../members/membersSlice';
import Button from '../../components/ui/Button';
import { UserCheck } from 'lucide-react';

interface Props {
  planId: number;
  planName: string;
  onClose: () => void;
}

export default function AssignPlan({ planId, planName, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { list: members } = useAppSelector((s) => s.members);
  const [selected, setSelected] = useState<number[]>([]);
  const [dayLabel, setDayLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    dispatch(fetchMembers({ status: 'active' }));
  }, [dispatch]);

  const toggle = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAssign = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    await dispatch(assignPlan({ id: planId, data: { member_ids: selected, day_label: dayLabel } }));
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-semibold text-gray-900">Plan Assigned!</p>
        <p className="text-sm text-gray-500 mt-1">
          <strong>{planName}</strong> assigned to {selected.length} member(s)
        </p>
        <Button onClick={onClose} className="mt-4">Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Assigning: <strong>{planName}</strong>
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Day Label (optional)</label>
        <input
          value={dayLabel}
          onChange={(e) => setDayLabel(e.target.value)}
          placeholder="e.g. Monday, Chest Day, Week A..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Select Members ({selected.length} selected)</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          {members.filter((m) => m.status === 'active').map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <input
                type="checkbox"
                checked={selected.includes(m.id)}
                onChange={() => toggle(m.id)}
                className="w-4 h-4 accent-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{m.full_name}</p>
                <p className="text-xs text-gray-500">{m.member_id}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={handleAssign} loading={saving} disabled={selected.length === 0} className="flex-1">
          Assign to {selected.length} Member{selected.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
