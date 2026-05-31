import { useEffect, useState } from 'react';
import { paymentsApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import MeasurementsPanel from '../measurements/MeasurementsPanel';
import { CreditCard, TrendingUp } from 'lucide-react';

interface Payment {
  id: number;
  amount: number;
  status: string;
  paid_date: string | null;
  created_at: string;
  plan_name: string | null;
}

interface Member {
  id: number;
  full_name: string;
  member_id: string;
  plan_name?: string | null;
}

interface Props {
  member: Member | null;
  onClose: () => void;
}

function PaymentHistory({ memberId }: { memberId: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi.memberPayments(memberId)
      .then((r) => setPayments(r.data))
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) return <div className="py-10 text-center text-gray-400">Loading...</div>;

  if (payments.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">
        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>No payment records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p, i) => (
        <div key={p.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${p.status === 'paid' ? 'bg-green-500' : p.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {i < payments.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[28px]" />}
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">₹{Number(p.amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.plan_name ?? 'Membership'} ·{' '}
                  {p.paid_date
                    ? new Date(p.paid_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                p.status === 'paid' ? 'bg-green-100 text-green-700' :
                p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MemberDetailModal({ member, onClose }: Props) {
  const [tab, setTab] = useState<'measurements' | 'payments'>('measurements');

  if (!member) return null;

  return (
    <Modal isOpen={!!member} onClose={onClose} title={member.full_name} size="lg">
      <p className="text-sm text-gray-500 -mt-1 mb-4">{member.member_id}{member.plan_name ? ` · ${member.plan_name}` : ''}</p>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setTab('measurements')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'measurements' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Measurements
        </button>
        <button
          onClick={() => setTab('payments')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'payments' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Payments
        </button>
      </div>

      {tab === 'measurements' ? (
        <MeasurementsPanel memberId={member.id} memberName={member.full_name} canEdit />
      ) : (
        <PaymentHistory memberId={member.id} />
      )}
    </Modal>
  );
}
