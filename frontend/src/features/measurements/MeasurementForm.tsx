import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../app/hooks';
import { addMeasurement } from './measurementsSlice';
import Button from '../../components/ui/Button';

interface Props {
  memberId: number;
  onClose: () => void;
}

type FormData = {
  recorded_date: string;
  weight_kg: string;
  height_cm: string;
  chest_cm: string;
  waist_cm: string;
  bicep_left_cm: string;
  bicep_right_cm: string;
  body_fat_pct: string;
  notes: string;
};

export default function MeasurementForm({ memberId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { recorded_date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    const toNum = (v: string) => (v ? parseFloat(v) : null);
    await dispatch(addMeasurement({
      member_id: memberId,
      recorded_date: data.recorded_date,
      weight_kg: toNum(data.weight_kg),
      height_cm: toNum(data.height_cm),
      chest_cm: toNum(data.chest_cm),
      waist_cm: toNum(data.waist_cm),
      bicep_left_cm: toNum(data.bicep_left_cm),
      bicep_right_cm: toNum(data.bicep_right_cm),
      body_fat_pct: toNum(data.body_fat_pct),
      notes: data.notes || null,
    }));
    onClose();
  };

  const numField = (label: string, name: keyof FormData, unit: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label} <span className="text-gray-400">({unit})</span></label>
      <input
        type="number"
        step="0.1"
        {...register(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          {...register('recorded_date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {numField('Weight', 'weight_kg', 'kg')}
        {numField('Height', 'height_cm', 'cm')}
        {numField('Chest', 'chest_cm', 'cm')}
        {numField('Waist', 'waist_cm', 'cm')}
        {numField('Left Bicep', 'bicep_left_cm', 'cm')}
        {numField('Right Bicep', 'bicep_right_cm', 'cm')}
        {numField('Body Fat', 'body_fat_pct', '%')}
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
        <Button type="submit" loading={isSubmitting} className="flex-1">Save Measurements</Button>
      </div>
    </form>
  );
}
