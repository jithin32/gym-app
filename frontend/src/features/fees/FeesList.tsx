import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPayments, updatePayment, type Payment } from './feesSlice';
import { statusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AddPayment from './AddPayment';
import { CreditCard, Plus, CheckCircle } from 'lucide-react';

export default function FeesList() {
  const dispatch = useAppDispatch();
  const { list: payments, loading } = useAppSelector((s) => s.fees);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [markPaying, setMarkPaying] = useState<Payment | null>(null);
  const [payMode, setPayMode] = useState('cash');

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const filtered = statusFilter ? payments.filter((p) => p.status === statusFilter) : payments;

  const handleMarkPaid = async () => {
    if (!markPaying) return;
    await dispatch(updatePayment({
      id: markPaying.id,
      data: {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_mode: payMode,
      },
    }));
    setMarkPaying(null);
  };

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status === 'pending').length;
  const overdue = payments.filter((p) => p.status === 'overdue').length;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees & Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{payments.length} total records</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Payment</span>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-500">Collected</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-amber-600">Pending</p>
          <p className="text-lg md:text-2xl font-bold text-amber-700 mt-1">{pending}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-red-600">Overdue</p>
          <p className="text-lg md:text-2xl font-bold text-red-700 mt-1">{overdue}</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'paid', 'pending', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No records found</div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Member</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Plan</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Paid Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Mode</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 whitespace-nowrap">{p.member_name}</div>
                      <div className="text-xs text-gray-500">{p.member_code}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.plan_name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.paid_date ? new Date(p.paid_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap">{p.payment_mode ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      {p.status !== 'paid' && (
                        <button
                          onClick={() => { setMarkPaying(p); setPayMode('cash'); }}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium whitespace-nowrap"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Payment Record">
        <AddPayment onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!markPaying} onClose={() => setMarkPaying(null)} title="Mark as Paid" size="sm">
        <p className="text-gray-600 mb-4">
          Mark payment of <strong>₹{markPaying?.amount}</strong> for{' '}
          <strong>{markPaying?.member_name}</strong> as paid?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
          <select
            value={payMode}
            onChange={(e) => setPayMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setMarkPaying(null)} className="flex-1">Cancel</Button>
          <Button onClick={handleMarkPaid} className="flex-1">
            <CreditCard className="w-4 h-4" />
            Confirm Paid
          </Button>
        </div>
      </Modal>
    </div>
  );
}
