import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../app/hooks';
import { createCoach, updateCoach, type Coach } from './coachesSlice';
import Button from '../../components/ui/Button';

interface Props {
  coach?: Coach | null;
  onClose: () => void;
}

type FormData = {
  full_name: string;
  phone: string;
  email: string;
  specialty: string;
  experience_yr: string;
};

export default function CoachForm({ coach, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    if (coach) {
      reset({
        full_name: coach.full_name,
        phone: coach.phone ?? '',
        email: coach.email ?? '',
        specialty: coach.specialty ?? '',
        experience_yr: String(coach.experience_yr ?? 0),
      });
    } else {
      reset({ experience_yr: '0' });
    }
  }, [coach, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, experience_yr: parseInt(data.experience_yr) || 0 };
    if (coach) {
      await dispatch(updateCoach({ id: coach.id, data: payload }));
    } else {
      await dispatch(createCoach(payload));
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {coach && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-sm text-primary-700">
          Coach ID: <strong>{coach.coach_id}</strong> · Default password = Coach ID
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
        <input
          {...register('full_name', { required: 'Full name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
          <input
            {...register('specialty')}
            placeholder="e.g. Strength & Conditioning"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <input
            type="number"
            {...register('experience_yr')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {coach ? 'Save Changes' : 'Add Coach'}
        </Button>
      </div>
    </form>
  );
}
