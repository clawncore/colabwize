import React, { useState, useEffect } from "react";
import { Scan, Loader2 } from "lucide-react";

interface VisualScannerOverlayProps {
  isActive: boolean;
  progress: number;
  onComplete: () => void;
  scanPhase: "extracting" | "analyzing" | "verifying" | "complete";
  chunkInfo?: {
    currentChunk: number;
    totalChunks: number;
    citationsFound: number;
  };
}

export const VisualScannerOverlay: React.FC<VisualScannerOverlayProps> = ({
  isActive,
  progress,
  onComplete,
  scanPhase,
  chunkInfo
}) => {
  // Reduce console spam - only log on significant changes
  React.useEffect(() => {
    console.log('🔍 VisualScannerOverlay state update:', { isActive, progress, scanPhase });
  }, [isActive, scanPhase]); // Only log when these key props change
  const [wavePosition, setWavePosition] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Animate wave movement with smoother progression
    const waveInterval = setInterval(() => {
      setWavePosition(prev => (prev + 1.5) % 100);
    }, 40);

    // Animate pulse intensity
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => (prev + 0.08) % 1);
    }, 80);

    return () => {
      clearInterval(waveInterval);
      clearInterval(pulseInterval);
    };
  }, [isActive]);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(onComplete, 800);
    }
  }, [progress, onComplete]);

  if (!isActive) return null;

  const getPhaseMessage = () => {
    switch (scanPhase) {
      case "extracting":
        return "Extracting document content...";
      case "analyzing":
        if (chunkInfo) {
          return `Analyzing chunk ${chunkInfo.currentChunk}/${chunkInfo.totalChunks} (${chunkInfo.citationsFound} citations found)...`;
        }
        return "Analyzing citation patterns...";
      case "verifying":
        return "Verifying source integrity...";
      case "complete":
        return "Audit complete!";
      default:
        return "Scanning...";
    }
  };

  const getPhaseColor = () => {
    switch (scanPhase) {
      case "extracting":
        return "from-blue-400 to-cyan-400";
      case "analyzing":
        return "from-purple-400 to-indigo-400";
      case "verifying":
        return "from-amber-400 to-orange-400";
      case "complete":
        return "from-green-400 to-emerald-400";
      default:
        return "from-blue-400 to-purple-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Main Scanner Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Citation Audit Scanner
            </h2>
            <p className="text-gray-600">
              {getPhaseMessage()}
            </p>
          </div>

          {/* Visual Wave Scanner */}
          <div className="relative h-32 mb-8 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200">
            {/* Animated Wave */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${getPhaseColor()} opacity-20`}
              style={{
                transform: `translateX(${wavePosition - 100}%)`,
                width: '200%',
                height: '100%'
              }}
            />
            
            {/* Pulse Effect */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${getPhaseColor()} opacity-${Math.round(pulseIntensity * 30)}`}
              style={{
                clipPath: `circle(${50 + pulseIntensity * 30}% at 50% 50%)`
              }}
            />

            {/* Scanning Lines */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                style={{
                  top: `${(i + 1) * 12.5}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}

            {/* Progress Indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`bg-gradient-to-r ${getPhaseColor()} h-2.5 rounded-full transition-all duration-300 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center border-2 border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {scanPhase === "extracting" ? "📄" : "✓"}
              </div>
              <div className="text-xs text-blue-800 font-medium">Content Extracted</div>
              {chunkInfo && (
                <div className="text-[10px] text-blue-600 mt-1">
                  {chunkInfo.totalChunks} chunks
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border-2 border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {scanPhase === "analyzing" ? "🔍" : (scanPhase === "extracting" ? "○" : "✓")}
              </div>
              <div className="text-xs text-purple-800 font-medium">Patterns Analyzed</div>
              {chunkInfo && (
                <div className="text-[10px] text-purple-600 mt-1">
                  {chunkInfo.citationsFound} citations
                </div>
              )}
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border-2 border-amber-100">
              <div className="text-2xl font-bold text-amber-600">
                {scanPhase === "verifying" ? "✅" : (scanPhase === "analyzing" || scanPhase === "extracting" ? "○" : "✓")}
              </div>
              <div className="text-xs text-amber-800 font-medium">Sources Verified</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {scanPhase === "complete" ? "🎉" : "○"}
              </div>
              <div className="text-xs text-green-800 font-medium">Audit Complete</div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">
                {getPhaseMessage()}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${getPhaseColor()} opacity-40`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};