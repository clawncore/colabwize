import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  // Calculate end time: 43 days from now
  const getEndTime = () => {
    const now = new Date().getTime();
    return now + (43 * 24 * 60 * 60 * 1000); // 43 days in milliseconds
  };

  // Initialize end time in state
  const [endTime, setEndTime] = useState(getEndTime());
  
  // Initialize time left
  const [timeLeft, setTimeLeft] = useState({
    days: 43,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Check if we have a stored end time in localStorage
    const storedEndTime = localStorage.getItem('countdownEndTime');
    if (storedEndTime) {
      const parsedEndTime = parseInt(storedEndTime, 10);
      // If the stored end time is in the future, use it
      if (parsedEndTime > new Date().getTime()) {
        setEndTime(parsedEndTime);
      } else {
        // If the stored time is in the past, set a new end time
        const newEndTime = getEndTime();
        setEndTime(newEndTime);
        localStorage.setItem('countdownEndTime', newEndTime.toString());
      }
    } else {
      // If no stored time, set and save the end time
      localStorage.setItem('countdownEndTime', endTime.toString());
    }

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