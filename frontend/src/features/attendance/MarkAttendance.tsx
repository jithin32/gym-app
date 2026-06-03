import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { checkStatus, markAttendance, checkoutAttendance } from './attendanceSlice';
import { CalendarCheck, CheckCircle, Clock, LogOut } from 'lucide-react';

export default function MarkAttendance() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { marked, checkIn, checkOut, date, marking, checkingOut } = useAppSelector((s) => s.attendance);
  const [now, setNow] = useState(new Date());
  const [justMarked, setJustMarked] = useState(false);
  const [justCheckedOut, setJustCheckedOut] = useState(false);

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

  const handleCheckout = async () => {
    const result = await dispatch(checkoutAttendance());
    if (checkoutAttendance.fulfilled.match(result)) {
      setJustCheckedOut(true);
    }
  };

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const checkInTime = checkIn ? new Date(checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;
  const checkOutTime = checkOut ? new Date(checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6">
      {/* Date & Time */}
      <div className="text-center mb-12">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Today</p>
        <p className="text-white text-xl font-medium">{dateStr}</p>
        <p className="text-primary-400 text-5xl font-mono font-bold mt-3">{timeStr}</p>
      </div>

      {marked || justMarked ? (
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Check-in confirmed */}
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
            checkOutTime || justCheckedOut
              ? 'bg-blue-900/40 border-blue-500'
              : 'bg-green-900/40 border-green-500'
          }`}>
            {checkOutTime || justCheckedOut
              ? <LogOut className="w-16 h-16 text-blue-400" />
              : <CheckCircle className="w-16 h-16 text-green-400" />
            }
          </div>

          <div>
            {justCheckedOut ? (
              <>
                <p className="text-blue-400 text-2xl font-bold">Checked Out!</p>
                <p className="text-gray-400 mt-1 text-sm">See you next time 👋</p>
              </>
            ) : justMarked ? (
              <>
                <p className="text-green-400 text-2xl font-bold">Attendance Marked!</p>
                <p className="text-gray-400 mt-1 text-sm">Redirecting to warm-up...</p>
              </>
            ) : (
              <>
                <p className="text-green-400 text-2xl font-bold">Already Checked In</p>
                <p className="text-gray-400 mt-1 text-sm">Have a great workout!</p>
              </>
            )}
          </div>

          {/* Time display */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-800 rounded-full px-5 py-2.5 justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Check-in</span>
              </div>
              <span className="text-white font-medium">{checkInTime}</span>
            </div>
            {(checkOutTime || justCheckedOut) && (
              <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-800 rounded-full px-5 py-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-blue-400" />
                  <span>Check-out</span>
                </div>
                <span className="text-white font-medium">
                  {checkOutTime ?? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!checkOutTime && !justCheckedOut && !justMarked && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold px-8 py-3 rounded-full transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                {checkingOut ? 'Checking out...' : 'Check Out'}
              </button>
              <button
                onClick={() => navigate('/member/warmup')}
                className="text-primary-400 hover:text-primary-300 text-sm underline transition"
              >
                Continue to warm-up →
              </button>
            </div>
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
