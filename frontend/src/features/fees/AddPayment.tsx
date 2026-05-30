import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addPayment } from './feesSlice';
import { fetchMembers, fetchPlans } from '../members/membersSlice';
import Button from '../../components/ui/Button';

interface Props { onClose: () => void; }

type FormData = {
  member_id: string;
  plan_id: string;
  amount: string;
  due_date: string;
  paid_date: string;
  payment_mode: string;
  status: string;
  notes: string;
};

export default function AddPayment({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { list: members, plans } = useAppSelector((s) => s.members);
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      status: 'pending',
      payment_mode: 'cash',
      due_date: new Date().toISOString().split('T')[0],
    },
  });

  const planId = watch('plan_id');

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (planId) {
      const plan = plans.find((p) => p.id === parseInt(planId));
      if (plan) setValue('amount', String(plan.price));
    }
  }, [planId, plans, setValue]);

  const onSubmit = async (data: FormData) => {
    await dispatch(addPayment({
      ...data,
      member_id: parseInt(data.member_id),
      plan_id: data.plan_id ? parseInt(data.plan_id) : null,
      amount: parseFloat(data.amount),
      paid_date: data.paid_date || null,
    }));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Member <span className="text-red-500">*</span></label>
        <select
          {...register('member_id', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name} ({m.member_id})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <select
            {...register('plan_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
          <input
            type="number"
            {...register('amount', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" {...register('due_date')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
          <input type="date" {...register('paid_date')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
          <select {...register('payment_mode')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">Save Payment</Button>
      </div>
    </form>
  );
}
