import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchToday } from './attendanceSlice';
import { attendanceApi } from '../../services/api';
import { CalendarCheck, Users, UserCheck, Dumbbell } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import WorkoutAssignModal from '../workoutPlans/WorkoutAssignModal';

interface MonthlyRecord {
  member_id: string;
  full_name: string;
  days_present: number;
  dates: string[];
}

interface AssignTarget {
  id: number;
  name: string;
}

export default function AttendanceReport() {
  const dispatch = useAppDispatch();
  const { todayRecords, presentCount, totalActive, date, loading } = useAppSelector((s) => s.attendance);
  const { user } = useAppSelector((s) => s.auth);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthly, setMonthly] = useState<MonthlyRecord[]>([]);
  const [tab, setTab] = useState<'today' | 'monthly'>('today');
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);

  const canAssign = user?.role === 'coach' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchToday());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'monthly') {
      attendanceApi.report({ month, year }).then((r) => setMonthly(r.data.records ?? []));
    }
  }, [tab, month, year]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">{new Date(date || Date.now()).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        {[
          { label: 'Present Today', value: presentCount, icon: UserCheck, bg: 'bg-green-100', text: 'text-green-600' },
          { label: 'Total Active', value: totalActive, icon: Users, bg: 'bg-blue-100', text: 'text-blue-600' },
          { label: 'Rate', value: totalActive ? `${Math.round((presentCount / totalActive) * 100)}%` : '0%', icon: CalendarCheck, bg: 'bg-primary-100', text: 'text-primary-600' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-5 flex flex-col md:flex-row md:items-start md:gap-4">
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 mb-1 md:mb-0 ${bg} ${text}`}>
              <Icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 leading-tight">{label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'today' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Today
        </button>
        <button
          onClick={() => setTab('monthly')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Monthly
        </button>
      </div>

      {tab === 'today' ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : todayRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No members checked in yet today</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Member</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Coach</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Check-In</th>
                    {canAssign && <th className="px-4 py-3 font-semibold text-gray-600">Workout</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {todayRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{r.full_name}</div>
                        <div className="text-xs text-gray-500">{r.member_id}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.coach_name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {canAssign && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setAssignTarget({ id: r.member_db_id, name: r.full_name })}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-medium transition"
                            title="Assign workout"
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Assign</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Member</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Days Present</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthly.map((r) => {
                  const daysInMonth = new Date(year, month, 0).getDate();
                  const pct = Math.round((r.days_present / daysInMonth) * 100);
                  return (
                    <tr key={r.member_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{r.full_name}</div>
                        <div className="text-xs text-gray-500">{r.member_id}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{r.days_present} days</td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign Workout — ${assignTarget?.name}`}
        size="lg"
      >
        {assignTarget && (
          <WorkoutAssignModal
            member={assignTarget}
            onClose={() => setAssignTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}
