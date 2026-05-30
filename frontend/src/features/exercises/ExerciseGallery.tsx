import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchExercises, fetchBodyParts, deleteExercise, type Exercise } from './exercisesSlice';
import { Search, ChevronDown, X, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ExerciseForm from './ExerciseForm';

const difficultyColor: Record<string, 'green' | 'yellow' | 'red'> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

const bodyPartLabels: Record<string, string> = {
  chest: 'Chest', back: 'Back', legs: 'Legs', biceps: 'Biceps',
  triceps: 'Triceps', shoulders: 'Shoulders', abs: 'Abs', full_body: 'Full Body',
};

function ExerciseDetailModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise.name} size="md">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="blue">{bodyPartLabels[exercise.body_part] ?? exercise.body_part}</Badge>
          <Badge variant={difficultyColor[exercise.difficulty] ?? 'gray'}>{exercise.difficulty}</Badge>
          {exercise.equipment && <Badge variant="gray">{exercise.equipment}</Badge>}
        </div>
        {exercise.how_to_do && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">How To Do</p>
            <p className="text-sm text-gray-700 leading-relaxed">{exercise.how_to_do}</p>
          </div>
        )}
        {exercise.muscles_targeted && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Muscles Targeted</p>
            <p className="text-sm text-gray-700">{exercise.muscles_targeted}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

interface ExerciseGalleryProps {
  selectable?: boolean;
  onSelect?: (exercise: Exercise) => void;
  selectedIds?: number[];
  canEdit?: boolean;
  multiSelect?: boolean;
  onMultiSelect?: (exercises: Exercise[]) => void;
}

export default function ExerciseGallery({ selectable, onSelect, selectedIds = [], canEdit = false, multiSelect, onMultiSelect }: ExerciseGalleryProps) {
  const dispatch = useAppDispatch();
  const { list, bodyParts, loading } = useAppSelector((s) => s.exercises);

  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Exercise | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingIds, setPendingIds] = useState<number[]>([]);

  useEffect(() => {
    dispatch(fetchBodyParts());
    dispatch(fetchExercises());
  }, [dispatch]);

  const filtered = list.filter((ex) => {
    const q = search.toLowerCase();
    const matchSearch = !q || ex.name.toLowerCase().includes(q) || (ex.muscles_targeted ?? '').toLowerCase().includes(q);
    const matchPart = !bodyPart || ex.body_part === bodyPart;
    return matchSearch && matchPart;
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await dispatch(deleteExercise(deleteConfirm.id));
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const handleCardClick = (ex: Exercise) => {
    if (!selectable) return;
    if (multiSelect) {
      if (selectedIds.includes(ex.id)) return;
      setPendingIds((prev) =>
        prev.includes(ex.id) ? prev.filter((id) => id !== ex.id) : [...prev, ex.id]
      );
    } else {
      onSelect?.(ex);
    }
  };

  const handleConfirmMulti = () => {
    const selected = list.filter((ex) => pendingIds.includes(ex.id));
    onMultiSelect?.(selected);
    setPendingIds([]);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">All Muscles</option>
            {bodyParts.map((bp) => (
              <option key={bp} value={bp}>{bodyPartLabels[bp] ?? bp}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Body part pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setBodyPart('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${!bodyPart ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {bodyParts.map((bp) => (
          <button
            key={bp}
            onClick={() => setBodyPart(bodyPart === bp ? '' : bp)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${bodyPart === bp ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {bodyPartLabels[bp] ?? bp}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading exercises...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No exercises match your search</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => {
            const isSelected = selectedIds.includes(ex.id);
            const isPending = pendingIds.includes(ex.id);
            const isMarked = isSelected || isPending;
            return (
              <div
                key={ex.id}
                onClick={() => handleCardClick(ex)}
                className={`bg-white rounded-xl border-2 p-4 transition group ${
                  selectable
                    ? `cursor-pointer hover:shadow-md ${isMarked ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-300'} ${isSelected && multiSelect ? 'opacity-50 cursor-default' : ''}`
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base font-bold text-gray-400 flex-shrink-0">
                    {ex.name.charAt(0)}
                  </div>

                  {isMarked && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-gray-400' : 'bg-primary-600'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {canEdit && !selectable && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditTarget(ex); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(ex); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3
                  className={`font-semibold text-gray-900 text-sm mb-1.5 leading-tight ${!selectable ? 'cursor-pointer hover:text-primary-600' : ''}`}
                  onClick={(e) => { if (!selectable) { e.stopPropagation(); setDetail(ex); } }}
                >
                  {ex.name}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="blue">{bodyPartLabels[ex.body_part] ?? ex.body_part}</Badge>
                  <Badge variant={difficultyColor[ex.difficulty] ?? 'gray'}>{ex.difficulty}</Badge>
                </div>

                {ex.equipment && <p className="text-xs text-gray-400 mt-2">{ex.equipment}</p>}
              </div>
            );
          })}
        </div>
      )}

      {multiSelect && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 mt-4">
          <Button
            onClick={handleConfirmMulti}
            disabled={pendingIds.length === 0}
            className="w-full"
          >
            {pendingIds.length === 0 ? 'Select exercises above' : `Add ${pendingIds.length} Exercise${pendingIds.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {detail && <ExerciseDetailModal exercise={detail} onClose={() => setDetail(null)} />}
      {editTarget && <ExerciseForm exercise={editTarget} onClose={() => setEditTarget(null)} />}

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Exercise" size="sm">
        <p className="text-gray-600 mb-4">
          Delete <strong>{deleteConfirm?.name}</strong>? This will remove it from all workout plans.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
