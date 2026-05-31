import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPlans } from './plansSlice';
import type { Exercise } from '../exercises/exercisesSlice';
import { plansApi } from '../../services/api';
import ExerciseGallery from '../exercises/ExerciseGallery';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Trash2, Plus, Dumbbell, UserCheck, Check } from 'lucide-react';

interface PlanItem {
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: string;
  suggested_weight: string;
  rest_seconds: number;
  notes: string;
}

interface Props {
  member: { id: number; name: string };
  onClose: () => void;
}

export default function WorkoutAssignModal({ member, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { list: plans } = useAppSelector((s) => s.plans);

  const [tab, setTab] = useState<'saved' | 'custom'>('saved');

  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);
  const [assigningPlans, setAssigningPlans] = useState(false);

  const [planName, setPlanName] = useState(`${member.name}'s Workout`);
  const [dayLabel, setDayLabel] = useState('');
  const [items, setItems] = useState<PlanItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const togglePlan = (id: number) =>
    setSelectedPlanIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAssignSaved = async () => {
    if (selectedPlanIds.length === 0) return;
    setAssigningPlans(true);
    setError('');
    try {
      for (const planId of selectedPlanIds) {
        await plansApi.assign(planId, { member_ids: [member.id], day_label: 'Today' });
      }
      setAssignedCount(selectedPlanIds.length);
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setAssigningPlans(false);
  };

  const handleMultiSelect = (selected: Exercise[]) => {
    const existingIds = items.map((i) => i.exercise_id);
    const newItems = selected
      .filter((ex) => !existingIds.includes(ex.id))
      .map((ex) => ({
        exercise_id: ex.id,
        exercise_name: ex.name,
        sets: 3,
        reps: '10-12',
        suggested_weight: '',
        rest_seconds: 60,
        notes: '',
      }));
    setItems((prev) => [...prev, ...newItems]);
    setShowPicker(false);
  };

  const updateItem = (idx: number, field: keyof PlanItem, value: string | number) =>
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleAssignCustom = async () => {
    if (!planName.trim()) { setError('Plan name is required'); return; }
    if (items.length === 0) { setError('Add at least one exercise'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await plansApi.create({ name: planName, exercises: items });
      await plansApi.assign(res.data.id, { member_ids: [member.id], day_label: dayLabel });
      dispatch(fetchPlans());
      setAssignedCount(1);
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-semibold text-gray-900">Workout Assigned!</p>
        <p className="text-sm text-gray-500 mt-1">
          {assignedCount > 1 ? `${assignedCount} plans assigned` : 'Plan assigned'} to <strong>{member.name}</strong>
        </p>
        <Button onClick={onClose} className="mt-4">Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('saved')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'saved' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Saved Plans
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'custom' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Custom
        </button>
      </div>

      {tab === 'saved' ? (
        <div className="space-y-3">
          {plans.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No saved plans yet. Use the Custom tab to create one.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => togglePlan(plan.id)}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                    selectedPlanIds.includes(plan.id)
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    selectedPlanIds.includes(plan.id) ? 'bg-primary-600' : 'border-2 border-gray-300'
                  }`}>
                    {selectedPlanIds.includes(plan.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{plan.name}</p>
                    <p className="text-xs text-gray-500">{plan.exercise_count} exercises</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleAssignSaved}
              loading={assigningPlans}
              disabled={selectedPlanIds.length === 0}
              className="flex-1"
            >
              {selectedPlanIds.length > 0
                ? `Assign ${selectedPlanIds.length} Plan${selectedPlanIds.length > 1 ? 's' : ''}`
                : 'Select Plans'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day Label <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={dayLabel}
              onChange={(e) => setDayLabel(e.target.value)}
              placeholder="e.g. Monday, Chest Day..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Exercises ({items.length})</p>
              <Button size="sm" variant="secondary" onClick={() => setShowPicker(true)}>
                <Plus className="w-4 h-4" /> Add Exercises
              </Button>
            </div>

            {items.length === 0 ? (
              <div
                onClick={() => setShowPicker(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition"
              >
                <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click to pick exercises from the gallery</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={item.exercise_id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 text-sm">{item.exercise_name}</p>
                      <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { label: 'Sets', field: 'sets' as keyof PlanItem, type: 'number', placeholder: '3' },
                        { label: 'Reps', field: 'reps' as keyof PlanItem, type: 'text', placeholder: '10-12' },
                        { label: 'Weight', field: 'suggested_weight' as keyof PlanItem, type: 'text', placeholder: '20kg' },
                        { label: 'Rest (s)', field: 'rest_seconds' as keyof PlanItem, type: 'number', placeholder: '60' },
                      ] as const).map(({ label, field, type, placeholder }) => (
                        <div key={field}>
                          <label className="block text-xs text-gray-500 mb-1">{label}</label>
                          <input
                            type={type}
                            value={String(item[field])}
                            onChange={(e) =>
                              updateItem(idx, field, type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value)
                            }
                            placeholder={placeholder}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleAssignCustom} loading={saving} disabled={items.length === 0} className="flex-1">
              Create & Assign
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} title="Pick Exercises" size="xl">
        <ExerciseGallery
          selectable
          multiSelect
          onMultiSelect={handleMultiSelect}
          selectedIds={items.map((i) => i.exercise_id)}
        />
      </Modal>
    </div>
  );
}
