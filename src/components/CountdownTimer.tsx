import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  // Fixed universal end time - same for all users
  // Set to a specific date and time (e.g., 43 days from a fixed start date)
  const getFixedEndTime = () => {
    // Set a fixed date (e.g., October 21, 2025 00:00:00 UTC)
    // You can adjust this date as needed
    const fixedEndDate = new Date('2025-11-25T00:00:00Z').getTime();
    return fixedEndDate;
  };

  // Initialize end time
  const endTime = getFixedEndTime();

  // Initialize time left
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Countdown finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

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