import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import ExerciseGallery from './ExerciseGallery';
import ExerciseForm from './ExerciseForm';
import Button from '../../components/ui/Button';

export default function ExerciseGalleryPage() {
  const { user } = useAppSelector((s) => s.auth);
  const canEdit = user?.role === 'admin' || user?.role === 'coach';
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse and manage exercises by muscle group</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" />
            Add Exercise
          </Button>
        )}
      </div>

      <ExerciseGallery canEdit={canEdit} />

      {showAdd && <ExerciseForm exercise={null} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
