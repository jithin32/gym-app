import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { checkStatus, markAttendance } from './attendanceSlice';
import { CalendarCheck, CheckCircle, Clock } from 'lucide-react';

export default function MarkAttendance() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { marked, checkIn, date, marking } = useAppSelector((s) => s.attendance);
  const [now, setNow] = useState(new Date());
  const [justMarked, setJustMarked] = useState(false);

  useEffect(() => {
    dispatch(checkStatus());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMark = async () => {
    const result = await dispatch(markAttendance());
    if (markAttendance.fulfilled.match(result)) {
      setJustMarked(true);
      setTimeout(() => navigate('/member/warmup'), 2000);
    }
  };

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const checkInTime = checkIn ? new Date(checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6">
      {/* Date & Time */}
      <div className="text-center mb-12">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Today</p>
        <p className="text-white text-xl font-medium">{dateStr}</p>
        <p className="text-primary-400 text-5xl font-mono font-bold mt-3">{timeStr}</p>
      </div>

      {marked || justMarked ? (
        /* Already marked state */
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-32 h-32 rounded-full bg-green-900/40 border-4 border-green-500 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <div>
            <p className="text-green-400 text-2xl font-bold">
              {justMarked ? 'Attendance Marked!' : 'Already Marked'}
            </p>
            <p className="text-gray-400 mt-1 text-sm">
              {justMarked ? 'Redirecting to warm-up...' : `Checked in at ${checkInTime}`}
            </p>
          </div>
          {!justMarked && (
            <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-800 rounded-full px-5 py-2.5">
              <Clock className="w-4 h-4" />
              <span>Check-in: {checkInTime}</span>
            </div>
          )}
          {!justMarked && (
            <button
              onClick={() => navigate('/member/warmup')}
              className="mt-2 text-primary-400 hover:text-primary-300 text-sm underline transition"
            >
              Continue to warm-up →
            </button>
          )}
        </div>
      ) : (
        /* Mark attendance button */
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleMark}
            disabled={marking}
            className="relative w-52 h-52 rounded-full bg-primary-600 hover:bg-primary-500 active:scale-95 disabled:bg-primary-800 disabled:cursor-not-allowed transition-all duration-150 shadow-2xl shadow-primary-900/50 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="absolute inset-0 rounded-full bg-primary-400/20 animate-ping group-hover:hidden" />
            <CalendarCheck className="w-14 h-14 text-white" />
            <span className="text-white font-bold text-lg tracking-wide">
              {marking ? 'Marking...' : 'MARK\nATTENDANCE'}
            </span>
          </button>
          <p className="text-gray-500 text-sm text-center">
            Tap the button to mark your attendance for {date}
          </p>
        </div>
      )}
    </div>
  );
}
