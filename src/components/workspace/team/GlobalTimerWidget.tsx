"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Timer } from "lucide-react";
import { Button } from "../../ui/button";
import {
  timeTrackingService,
  TimeEntry,
} from "../../../services/timeTrackingService";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";

import { useTimeTracking } from "../../../contexts/TimeTrackingContext";

export const GlobalTimerWidget = () => {
  const { activeTimer, elapsedTime, stopTimer } = useTimeTracking();
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleStop = async () => {
    try {
      await stopTimer();
    } catch (error) {
      console.error("Failed to stop timer", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeTimer) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-white border border-border rounded-lg shadow-lg p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300",
        !isVisible && "hidden",
      )}>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
          <Timer className="h-3 w-3 animate-pulse text-emerald-500" /> Tracking
          Time
        </span>
        <span className="text-sm font-medium truncate max-w-[200px]">
          {activeTimer.task?.title || "Unknown Task"}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {formatDuration(elapsedTime)}
        </span>
      </div>

      <div className="h-8 w-[1px] bg-border mx-1" />

      <Button
        variant="destructive"
        onClick={handleStop}
        className="h-8 w-8 p-0 rounded-full"
        title="Stop Timer">
        <Square className="h-3 w-3 fill-current" />
      </Button>
    </div>
  );
};
