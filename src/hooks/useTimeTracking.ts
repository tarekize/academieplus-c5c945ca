import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeTrackingOptions {
  contentType: "chapter" | "quiz" | "exercise";
  contentId: string;
  chapterId?: string;
  autoStart?: boolean;
  saveIntervalMs?: number;
  enabled?: boolean;
}

interface TimeTrackingResult {
  elapsedSeconds: number;
  formattedTime: string;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  }
  if (minutes > 0) {
    return `${minutes}min ${secs.toString().padStart(2, "0")}s`;
  }
  return `${secs}s`;
};

// Simplified time tracking hook that only tracks in memory
// TODO: Add database persistence when time_tracking table is created
export const useTimeTracking = ({
  contentType,
  contentId,
  chapterId,
  autoStart = true,
  saveIntervalMs = 30000,
  enabled = true,
}: TimeTrackingOptions): TimeTrackingResult => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<number>(0);

  // Sync elapsedRef with elapsedSeconds
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Démarrer le compteur
  const start = useCallback(() => {
    if (isRunning || !enabled) return;

    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        elapsedRef.current = prev + 1;
        return prev + 1;
      });
    }, 1000);
  }, [isRunning, enabled]);

  // Pause
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
  }, [isRunning, isPaused]);

  // Resume
  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        elapsedRef.current = prev + 1;
        return prev + 1;
      });
    }, 1000);
  }, [isPaused]);

  // Reset
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds(0);
    elapsedRef.current = 0;
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // Auto-start si demandé
  useEffect(() => {
    if (autoStart && enabled && contentId && contentId !== "none") {
      start();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, enabled, contentId, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
  };
};

// Stubbed functions for when the time_tracking table doesn't exist
export const useTimeStats = (userId?: string) => {
  return {
    totalTime: 0,
    todayTime: 0,
    weekTime: 0,
    loading: false,
  };
};

export const useContentProgress = (contentType: string, contentIds: string[]) => {
  return {
    progress: {} as Record<string, number>,
    loading: false,
  };
};

// Stubbed hook for chapters times
export const useChaptersTimes = (chapterIds: string[]) => {
  return {
    times: {} as Record<string, number>,
    loading: false,
  };
};

// Stubbed hook for exercises times
export const useExercisesTimes = (exerciseIds: string[]) => {
  return {
    times: {} as Record<string, number>,
    loading: false,
  };
};
