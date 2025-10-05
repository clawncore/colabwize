import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 34,
    seconds: 20
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{timeLeft.days}</div>
        <div className="text-xs text-gray-600">Days</div>
      </div>
      <div className="text-2xl font-bold text-gray-400">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{timeLeft.hours}</div>
        <div className="text-xs text-gray-600">Hours</div>
      </div>
      <div className="text-2xl font-bold text-gray-400">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-600">Minutes</div>
      </div>
      <div className="text-2xl font-bold text-gray-400">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-600">Seconds</div>
      </div>
    </div>
  );
}
