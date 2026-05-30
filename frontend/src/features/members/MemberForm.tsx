import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createMember, updateMember, fetchPlans, type Member } from './membersSlice';
import Button from '../../components/ui/Button';

interface Props {
  member?: Member | null;
  onClose: () => void;
  coaches: { id: number; full_name: string }[];
}

type FormData = {
  full_name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  join_date: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  coach_id: string;
  goal: string;
  injuries: string;
  experience: string;
  emergency_contact: string;
};

export default function MemberForm({ member, onClose, coaches }: Props) {
  const dispatch = useAppDispatch();
  const { plans } = useAppSelector((s) => s.members);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>();

  const planId = watch('plan_id');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (member) {
      reset({
        full_name: member.full_name,
        age: String(member.age ?? ''),
        gender: member.gender ?? '',
        phone: member.phone ?? '',
        email: member.email ?? '',
        address: member.address ?? '',
        join_date: member.join_date?.split('T')[0] ?? '',
        plan_id: String(member.plan_id ?? ''),
        start_date: member.start_date?.split('T')[0] ?? '',
        end_date: member.end_date?.split('T')[0] ?? '',
        coach_id: String(member.coach_id ?? ''),
        goal: member.goal ?? '',
        injuries: member.injuries ?? '',
        experience: member.experience ?? 'beginner',
        emergency_contact: member.emergency_contact ?? '',
      });
    } else {
      reset({ experience: 'beginner', gender: 'Male', goal: 'weight_loss' });
    }
  }, [member, reset]);

  // Auto-calculate end date when plan changes
  useEffect(() => {
    if (!planId) return;
    const plan = plans.find((p) => p.id === parseInt(planId));
    if (!plan) return;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration_days);
    setValue('start_date', start.toISOString().split('T')[0]);
    setValue('end_date', end.toISOString().split('T')[0]);
  }, [planId, plans, setValue]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      age: parseInt(data.age) || null,
      plan_id: parseInt(data.plan_id),
      coach_id: data.coach_id ? parseInt(data.coach_id) : null,
    };
    if (member) {
      await dispatch(updateMember({ id: member.id, data: payload }));
    } else {
      await dispatch(createMember(payload));
    }
    onClose();
  };

  const field = (label: string, name: keyof FormData, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, { required: required ? `${label} is required` : false })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {member && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-sm text-primary-700">
          Member ID: <strong>{member.member_id}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">{field('Full Name', 'full_name', 'text', true)}</div>
        {field('Age', 'age', 'number')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select {...register('gender')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {field('Phone', 'phone', 'tel')}
        {field('Email', 'email', 'email')}
        <div className="col-span-2">{field('Address', 'address')}</div>
        {field('Emergency Contact', 'emergency_contact')}
        {field('Join Date', 'join_date', 'date')}
      </div>

      <hr className="border-gray-200" />
      <p className="text-sm font-semibold text-gray-700">Membership</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan <span className="text-red-500">*</span></label>
          <select {...register('plan_id', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price} / {p.duration_days} days
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Coach</label>
          <select {...register('coach_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">No coach</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
        {field('Start Date', 'start_date', 'date')}
        {field('End Date', 'end_date', 'date')}
      </div>

      <hr className="border-gray-200" />
      <p className="text-sm font-semibold text-gray-700">Fitness Profile</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select {...register('goal')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
          <select {...register('experience')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Injuries / Medical Notes</label>
          <textarea {...register('injuries')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {member ? 'Save Changes' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}
