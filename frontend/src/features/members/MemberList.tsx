import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMembers, deleteMember, freezeMember, type Member } from './membersSlice';
import { fetchCoaches } from '../coaches/coachesSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge, { statusBadge } from '../../components/ui/Badge';
import MemberForm from './MemberForm';
import { Search, UserPlus, Pencil, Trash2, SnowflakeIcon, RefreshCw, Dumbbell } from 'lucide-react';
import QuickAssignModal from '../workoutPlans/QuickAssignModal';

export default function MemberList() {
  const dispatch = useAppDispatch();
  const { list: members, loading } = useAppSelector((s) => s.members);
  const { list: coaches } = useAppSelector((s) => s.coaches);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Member | null>(null);
  const [assignTarget, setAssignTarget] = useState<Member | null>(null);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchCoaches());
  }, [dispatch]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.member_id.toLowerCase().includes(q) ||
      (m.phone && m.phone.includes(q));
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await dispatch(deleteMember(deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const goalLabel: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    endurance: 'Endurance',
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} total members</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="font-medium">No members found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Member</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Plan</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Goal</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Coach</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Expires</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{m.full_name}</div>
                    <div className="text-xs text-gray-500">{m.member_id} · {m.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.plan_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="blue">{goalLabel[m.goal] ?? m.goal}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.coach_name ?? <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {m.end_date ? new Date(m.end_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(m.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAssignTarget(m)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition"
                        title="Assign workout"
                      >
                        <Dumbbell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditing(m); setShowForm(true); }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => dispatch(freezeMember(m.id))}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition"
                        title={m.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                      >
                        {m.status === 'frozen' ? <RefreshCw className="w-4 h-4" /> : <SnowflakeIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(m)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Member' : 'Add New Member'}
        size="lg"
      >
        <MemberForm
          member={editing}
          coaches={coaches.map((c) => ({ id: c.id, full_name: c.full_name }))}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Quick assign workout */}
      <Modal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign Workout — ${assignTarget?.full_name}`}
        size="lg"
      >
        {assignTarget && (
          <QuickAssignModal
            member={{ id: assignTarget.id, full_name: assignTarget.full_name }}
            onClose={() => setAssignTarget(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Member" size="sm">
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{deleteConfirm?.full_name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
