import { useState, useEffect } from "react";
import { X, Video } from "lucide-react";

interface VideoNotificationProps {
  onClose: () => void;
  onPlayVideo: () => void;
}

export default function VideoNotification({
  onClose,
  onPlayVideo,
}: VideoNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Auto-close after 69 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 69000);

    // Periodic shaking effect every 3 seconds with enhanced styling
    const shakeInterval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000); // Shake for 1 second
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(shakeInterval);
    };
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-pop-in">
      {/* Shaking container with enhanced styling */}
      <div 
        className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-4 max-w-xs border-2 border-white cursor-pointer transform transition-all duration-300 hover:scale-105 ${isShaking ? 'animate-shake' : ''}`}
        onClick={onPlayVideo}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg flex items-center">
            <Video className="mr-2 animate-pulse" size={20} />
            Special Message!
          </h3>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent click
              setIsVisible(false);
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-3 text-sm">
          You have a special video waiting for you! Watch now to learn more about ColabWize.
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            onPlayVideo();
          }}
          className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition duration-200 flex items-center justify-center shadow-md"
        >
          <Video className="mr-2" size={16} />
          Watch Now
        </button>
      </div>
    </div>
  );
}