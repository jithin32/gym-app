import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPlans, deletePlan, type WorkoutPlan } from './plansSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import PlanBuilder from './PlanBuilder';
import AssignPlan from './AssignPlan';
import { Plus, Pencil, Trash2, UserPlus, Dumbbell, ChevronRight } from 'lucide-react';
import { plansApi } from '../../services/api';
import type { PlanExercise } from './plansSlice';

export default function PlanList() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.plans);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState<WorkoutPlan | null>(null);
  const [assigning, setAssigning] = useState<WorkoutPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WorkoutPlan | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [planDetail, setPlanDetail] = useState<{ [id: number]: PlanExercise[] }>({});

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const toggleExpand = async (planId: number) => {
    if (expanded === planId) { setExpanded(null); return; }
    setExpanded(planId);
    if (!planDetail[planId]) {
      const res = await plansApi.get(planId);
      setPlanDetail((prev) => ({ ...prev, [planId]: res.data.exercises ?? [] }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">{list.length} plans created</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowBuilder(true); }}>
          <Plus className="w-4 h-4" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No workout plans yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first plan and assign it to members</p>
          <Button className="mt-4" onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4" />
            Create First Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Plan header */}
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleExpand(plan.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-500">
                      {plan.exercise_count} exercise{Number(plan.exercise_count) !== 1 ? 's' : ''}
                      {plan.coach_name && ` · by ${plan.coach_name}`}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded === plan.id ? 'rotate-90' : ''}`} />
                </button>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setAssigning(plan)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                    title="Assign to members"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setEditing(plan); setShowBuilder(true); }}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(plan)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded exercises */}
              {expanded === plan.id && (
                <div className="border-t border-gray-100">
                  {!planDetail[plan.id] ? (
                    <div className="text-center py-4 text-gray-400 text-sm">Loading exercises...</div>
                  ) : planDetail[plan.id].length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">No exercises in this plan</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Exercise</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Sets</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Reps</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Weight</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Rest</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {planDetail[plan.id].map((ex) => (
                          <tr key={ex.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-800">{ex.exercise_name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{ex.sets}</td>
                            <td className="px-4 py-2.5 text-gray-600">{ex.reps}</td>
                            <td className="px-4 py-2.5 text-gray-600">{ex.suggested_weight || '—'}</td>
                            <td className="px-4 py-2.5 text-gray-600">{ex.rest_seconds}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan builder modal */}
      <Modal
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        title={editing ? 'Edit Plan' : 'Create Workout Plan'}
        size="xl"
      >
        <PlanBuilder plan={editing} onClose={() => setShowBuilder(false)} />
      </Modal>

      {/* Assign modal */}
      <Modal
        isOpen={!!assigning}
        onClose={() => setAssigning(null)}
        title="Assign Plan to Members"
      >
        {assigning && (
          <AssignPlan
            planId={assigning.id}
            planName={assigning.name}
            onClose={() => setAssigning(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Plan" size="sm">
        <p className="text-gray-600 mb-4">
          Delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => { dispatch(deletePlan(deleteConfirm!.id)); setDeleteConfirm(null); }} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
