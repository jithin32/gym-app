import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import { Users, CalendarCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';

interface Member {
  id: number;
  member_id: string;
  full_name: string;
  goal: string;
  status: string;
  plan_name: string;
}

export default function CoachDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.coachStats().then((res) => {
      setMembers(res.data.members ?? []);
      setTotal(res.data.totalMembers ?? 0);
      setPresent(res.data.presentToday ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  const goalLabel: Record<string, string> = {
    weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', endurance: 'Endurance',
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard title="My Members" value={total} icon={Users} color="bg-blue-100 text-blue-600" />
        <StatCard title="Present Today" value={present} icon={CalendarCheck} color="bg-green-100 text-green-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Assigned Members</h2>
        </div>
        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Member</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Plan</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Goal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 whitespace-nowrap">{m.full_name}</div>
                    <div className="text-xs text-gray-500">{m.member_id}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.plan_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="blue">{goalLabel[m.goal] ?? m.goal}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
