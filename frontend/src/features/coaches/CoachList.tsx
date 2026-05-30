import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCoaches, deleteCoach, type Coach } from './coachesSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import CoachForm from './CoachForm';
import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';

export default function CoachList() {
  const dispatch = useAppDispatch();
  const { list: coaches, loading } = useAppSelector((s) => s.coaches);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Coach | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    dispatch(fetchCoaches());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await dispatch(deleteCoach(deleteConfirm.id));
    if (deleteCoach.rejected.match(result)) {
      setDeleteError(result.payload as string);
    } else {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coaches.length} coaches on staff</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <UserPlus className="w-4 h-4" />
          Add Coach
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditing(c); setShowForm(true); }}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setDeleteError(''); setDeleteConfirm(c); }}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{c.full_name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{c.coach_id}</p>
              <p className="text-sm text-primary-600 mt-1">{c.specialty}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.email} · {c.phone}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{c.member_count ?? 0} active members</span>
                <span className="ml-auto text-xs text-gray-400">{c.experience_yr}y exp.</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Coach' : 'Add New Coach'}>
        <CoachForm coach={editing} onClose={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Coach" size="sm">
        {deleteError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {deleteError}
          </div>
        )}
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{deleteConfirm?.full_name}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
