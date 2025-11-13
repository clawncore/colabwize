import { X } from "lucide-react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({ isOpen, onClose }: VideoPlayerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 w-full h-full">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-75 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
          <video
            controls
            autoPlay
            className="w-full h-full object-contain max-w-full max-h-full"
          >
            <source src="/assets/colabwize.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="p-4 bg-gray-50">
          <h2 className="text-xl font-bold mb-2">Welcome to ColabWize</h2>
          <p className="text-gray-600">
            Experience the future of academic writing with ColabWize.
            Join our waitlist to be among the first to use our revolutionary platform.
          </p>
        </div>
      </div>
    </div>
  );
}