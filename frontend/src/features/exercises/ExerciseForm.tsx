import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { createExercise, updateExercise, type Exercise } from './exercisesSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const BODY_PARTS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'full_body'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['Strength', 'Cardio', 'Flexibility', 'Compound', 'Isolation', 'Bodyweight'];

interface Props {
  exercise?: Exercise | null;
  onClose: () => void;
}

const empty = { name: '', body_part: 'chest', category: '', difficulty: 'beginner', equipment: '', muscles_targeted: '', how_to_do: '' };

export default function ExerciseForm({ exercise, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState(exercise ? {
    name: exercise.name,
    body_part: exercise.body_part,
    category: exercise.category ?? '',
    difficulty: exercise.difficulty,
    equipment: exercise.equipment ?? '',
    muscles_targeted: exercise.muscles_targeted ?? '',
    how_to_do: exercise.how_to_do ?? '',
  } : { ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Exercise name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (exercise) {
        await dispatch(updateExercise({ id: exercise.id, data: form })).unwrap();
      } else {
        await dispatch(createExercise(form)).unwrap();
      }
      onClose();
    } catch {
      setError('Failed to save exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={exercise ? 'Edit Exercise' : 'Add Exercise'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Barbell Bench Press"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Body part + difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Part</label>
            <select
              value={form.body_part}
              onChange={(e) => set('body_part', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {BODY_PARTS.map((bp) => (
                <option key={bp} value={bp}>{bp.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category + Equipment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <input
              value={form.equipment}
              onChange={(e) => set('equipment', e.target.value)}
              placeholder="e.g. Barbell, Dumbbell"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Muscles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Muscles Targeted</label>
          <input
            value={form.muscles_targeted}
            onChange={(e) => set('muscles_targeted', e.target.value)}
            placeholder="e.g. Pectoralis major, Anterior deltoid"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* How to do */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">How To Do</label>
          <textarea
            value={form.how_to_do}
            onChange={(e) => set('how_to_do', e.target.value)}
            placeholder="Step-by-step instructions..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={saving} className="flex-1">
            {exercise ? 'Save Changes' : 'Add Exercise'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
