import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMemberPlan, completeWorkout } from '../workoutPlans/plansSlice';
import { fetchExercises, fetchBodyParts, type Exercise } from '../exercises/exercisesSlice';
import {
  Dumbbell, CheckCircle, Clock, ChevronDown, ChevronUp,
  Play, Square,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const difficultyColor: Record<string, 'green' | 'yellow' | 'red'> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

const bodyPartLabels: Record<string, string> = {
  chest: 'Chest', back: 'Back', legs: 'Legs', biceps: 'Biceps',
  triceps: 'Triceps', shoulders: 'Shoulders', abs: 'Abs', full_body: 'Full Body',
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ExerciseDetailModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title={exercise.name} size="md">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="blue">{bodyPartLabels[exercise.body_part] ?? exercise.body_part}</Badge>
          <Badge variant={difficultyColor[exercise.difficulty] ?? 'gray'}>{exercise.difficulty}</Badge>
          {exercise.equipment && <Badge variant="gray">{exercise.equipment}</Badge>}
        </div>
        {exercise.muscles_targeted && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Muscles</p>
            <p className="text-gray-800 text-sm">{exercise.muscles_targeted}</p>
          </div>
        )}
        {exercise.how_to_do && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">How To Do</p>
            <p className="text-gray-700 text-sm leading-relaxed">{exercise.how_to_do}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function WorkoutPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { memberPlan, loading: planLoading } = useAppSelector((s) => s.plans);
  const { list: exercises, bodyParts } = useAppSelector((s) => s.exercises);

  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  // Timer
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Completion
  const [completing, setCompleting] = useState(false);
  const [completedDuration, setCompletedDuration] = useState<number | null>(null);

  useEffect(() => {
    if (user) dispatch(fetchMemberPlan(user.id));
    dispatch(fetchBodyParts());
    dispatch(fetchExercises());
  }, [dispatch, user]);

  useEffect(() => {
    if (workoutStarted) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [workoutStarted]);

  const handleStart = () => { setElapsed(0); setWorkoutStarted(true); };

  const handleEnd = async () => {
    setWorkoutStarted(false);
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));
    setCompleting(true);
    await dispatch(completeWorkout({
      plan_id: memberPlan?.plan_id ?? null,
      duration_minutes: durationMinutes,
    }));
    setCompleting(false);
    setCompletedDuration(durationMinutes);
  };

  const [activeTab, setActiveTab] = useState<'plan' | 'browser'>('plan');

  const browsedExercises = selectedBodyPart
    ? exercises.filter((e) => e.body_part === selectedBodyPart)
    : [];

  if (completedDuration !== null) {
    const hrs = Math.floor(completedDuration / 60);
    const mins = completedDuration % 60;
    const durationLabel = hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ''}` : `${mins} min`;
    return (
      <div className="p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-900/30 border-4 border-green-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-green-400 text-2xl font-bold mb-1">Workout Complete!</h2>
        <p className="text-white text-lg font-semibold mb-1">{durationLabel}</p>
        <p className="text-gray-400 text-sm">Great job! Your session has been logged.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">

      {/* ── Timer bar ── */}
      <div className={`rounded-2xl border p-4 transition-all ${workoutStarted ? 'bg-gray-800 border-primary-700' : 'bg-gray-800 border-gray-700'}`}>
        {workoutStarted ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-gray-400 text-xs uppercase tracking-widest">In Progress</p>
              </div>
              <p className="text-white text-4xl font-mono font-bold">{formatTime(elapsed)}</p>
            </div>
            <button
              onClick={handleEnd}
              disabled={completing}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition text-sm"
            >
              <Square className="w-4 h-4 fill-white" />
              {completing ? 'Saving…' : 'End Workout'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Ready to train?</p>
              <p className="text-gray-400 text-xs mt-0.5">Start the timer when you begin</p>
            </div>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl transition text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Start
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === 'plan'
                ? 'text-white border-b-2 border-primary-500 bg-gray-800'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            My Plan
          </button>
          <button
            onClick={() => setActiveTab('browser')}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === 'browser'
                ? 'text-white border-b-2 border-primary-500 bg-gray-800'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Exercise Browser
          </button>
        </div>

        {/* ── My Plan tab ── */}
        {activeTab === 'plan' && (
          planLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading plan...</div>
          ) : memberPlan ? (
            <>
              <div className="px-4 pt-4 pb-3 border-b border-gray-700">
                <h2 className="text-white font-bold">{memberPlan.plan_name}</h2>
                {memberPlan.day_label && <p className="text-primary-400 text-xs mt-0.5">{memberPlan.day_label}</p>}
                <p className="text-gray-500 text-xs mt-1">{memberPlan.exercises?.length ?? 0} exercises</p>
              </div>
              <div className="divide-y divide-gray-700">
                {(memberPlan.exercises ?? []).map((ex, idx) => (
                  <div key={ex.id}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpandedPlan(expandedPlan === idx ? null : idx)}
                    >
                      <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{ex.exercise_name}</p>
                        <p className="text-gray-500 text-xs">
                          {ex.sets}×{ex.reps}{ex.suggested_weight ? ` · ${ex.suggested_weight}` : ''}
                        </p>
                      </div>
                      {ex.difficulty && (
                        <Badge variant={difficultyColor[ex.difficulty] ?? 'gray'}>{ex.difficulty}</Badge>
                      )}
                      {expandedPlan === idx
                        ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    </button>
                    {expandedPlan === idx && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[['Sets', ex.sets], ['Reps', ex.reps], ['Weight', ex.suggested_weight || 'BW'], ['Rest', `${ex.rest_seconds}s`]].map(([l, v]) => (
                            <div key={String(l)} className="bg-gray-700/50 rounded-lg p-2 text-center">
                              <p className="text-gray-500 text-[10px]">{l}</p>
                              <p className="text-white text-sm font-bold mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                        {ex.how_to_do && <p className="text-gray-300 text-sm leading-relaxed">{ex.how_to_do}</p>}
                        {ex.muscles_targeted && (
                          <p className="text-gray-500 text-xs">Muscles: {ex.muscles_targeted}</p>
                        )}
                        {ex.rest_seconds && (
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Rest {ex.rest_seconds}s between sets</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <Dumbbell className="w-10 h-10 text-gray-600" />
              <p className="text-gray-400 text-sm">No workout plan assigned yet.</p>
              <p className="text-gray-500 text-xs">Switch to the Exercise Browser tab to explore exercises by muscle group.</p>
            </div>
          )
        )}

        {/* ── Exercise Browser tab ── */}
        {activeTab === 'browser' && (
          <>
            {/* Body part pills */}
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-700">
              {bodyParts.map((bp) => (
                <button
                  key={bp}
                  onClick={() => setSelectedBodyPart(selectedBodyPart === bp ? '' : bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedBodyPart === bp
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {bodyPartLabels[bp] ?? bp}
                </button>
              ))}
            </div>

            {!selectedBodyPart ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                Select a muscle group above
              </div>
            ) : browsedExercises.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No exercises found</div>
            ) : (
              <div className="divide-y divide-gray-700">
                {browsedExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setDetailExercise(ex)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700/40 transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-base font-bold text-gray-400 flex-shrink-0">
                      {ex.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{ex.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {ex.equipment || 'Bodyweight'}
                        {ex.muscles_targeted ? ` · ${ex.muscles_targeted}` : ''}
                      </p>
                    </div>
                    <Badge variant={difficultyColor[ex.difficulty] ?? 'gray'}>{ex.difficulty}</Badge>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Exercise detail modal */}
      {detailExercise && (
        <ExerciseDetailModal exercise={detailExercise} onClose={() => setDetailExercise(null)} />
      )}
    </div>
  );
}
