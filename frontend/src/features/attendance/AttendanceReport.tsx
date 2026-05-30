import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchToday } from './attendanceSlice';
import { attendanceApi } from '../../services/api';
import { CalendarCheck, Users, UserCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

interface MonthlyRecord {
  member_id: string;
  full_name: string;
  days_present: number;
  dates: string[];
}

export default function AttendanceReport() {
  const dispatch = useAppDispatch();
  const { todayRecords, presentCount, totalActive, date, loading } = useAppSelector((s) => s.attendance);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthly, setMonthly] = useState<MonthlyRecord[]>([]);
  const [tab, setTab] = useState<'today' | 'monthly'>('today');

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">{new Date(date || Date.now()).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Present Today" value={presentCount} icon={UserCheck} color="bg-green-100 text-green-600" />
        <StatCard title="Total Active" value={totalActive} icon={Users} color="bg-blue-100 text-blue-600" />
        <StatCard
          title="Attendance Rate"
          value={totalActive ? `${Math.round((presentCount / totalActive) * 100)}%` : '0%'}
          icon={CalendarCheck}
          color="bg-primary-100 text-primary-600"
        />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Member</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Coach</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todayRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.full_name}</div>
                      <div className="text-xs text-gray-500">{r.member_id}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.coach_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
