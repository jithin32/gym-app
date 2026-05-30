import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createPlan, updatePlan, type WorkoutPlan, type PlanExercise } from './plansSlice';
import { fetchExercises } from '../exercises/exercisesSlice';
import ExerciseGallery from '../exercises/ExerciseGallery';
import type { Exercise } from '../exercises/exercisesSlice';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Trash2, GripVertical, Plus, Dumbbell } from 'lucide-react';

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
  plan?: WorkoutPlan | null;
  onClose: () => void;
}

export default function PlanBuilder({ plan, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { list: exercises } = useAppSelector((s) => s.exercises);

  const [name, setName] = useState(plan?.name ?? '');
  const [items, setItems] = useState<PlanItem[]>(
    (plan?.exercises ?? []).map((e: PlanExercise) => ({
      exercise_id: e.exercise_id,
      exercise_name: e.exercise_name,
      sets: e.sets ?? 3,
      reps: e.reps ?? '10',
      suggested_weight: e.suggested_weight ?? '',
      rest_seconds: e.rest_seconds ?? 60,
      notes: e.notes ?? '',
    }))
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSelectExercise = (ex: Exercise) => {
    if (items.find((i) => i.exercise_id === ex.id)) return;
    setItems((prev) => [...prev, {
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: 3,
      reps: '10-12',
      suggested_weight: '',
      rest_seconds: 60,
      notes: '',
    }]);
    setShowPicker(false);
  };

  const updateItem = (idx: number, field: keyof PlanItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim()) { setError('Plan name is required'); return; }
    if (items.length === 0) { setError('Add at least one exercise'); return; }
    setSaving(true);
    setError('');

    const payload = { name, exercises: items };
    if (plan) {
      await dispatch(updatePlan({ id: plan.id, data: payload }));
    } else {
      await dispatch(createPlan(payload));
    }
    setSaving(false);
    onClose();
  };

  const selectedIds = items.map((i) => i.exercise_id);

  // Pre-load exercises for the picker
  const handleOpenPicker = () => {
    if (exercises.length === 0) dispatch(fetchExercises());
    setShowPicker(true);
  };

  return (
    <div className="space-y-5">
      {/* Plan name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day, Full Body A..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Exercises list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Exercises ({items.length})</p>
          <Button size="sm" variant="secondary" onClick={handleOpenPicker}>
            <Plus className="w-4 h-4" />
            Add Exercise
          </Button>
        </div>

        {items.length === 0 ? (
          <div
            onClick={handleOpenPicker}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition"
          >
            <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Click to add exercises from the gallery</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.exercise_id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.exercise_name}</p>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sets</label>
                    <input
                      type="number"
                      value={item.sets}
                      onChange={(e) => updateItem(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reps</label>
                    <input
                      value={item.reps}
                      onChange={(e) => updateItem(idx, 'reps', e.target.value)}
                      placeholder="e.g. 10-12"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weight</label>
                    <input
                      value={item.suggested_weight}
                      onChange={(e) => updateItem(idx, 'suggested_weight', e.target.value)}
                      placeholder="e.g. 20kg"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rest (sec)</label>
                    <input
                      type="number"
                      value={item.rest_seconds}
                      onChange={(e) => updateItem(idx, 'rest_seconds', parseInt(e.target.value) || 30)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-4">
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <input
                      value={item.notes}
                      onChange={(e) => updateItem(idx, 'notes', e.target.value)}
                      placeholder="Optional note..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">
          {plan ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>

      {/* Exercise picker modal */}
      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} title="Pick an Exercise" size="xl">
        <ExerciseGallery
          selectable
          onSelect={handleSelectExercise}
          selectedIds={selectedIds}
        />
      </Modal>
    </div>
  );
}
