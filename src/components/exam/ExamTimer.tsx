import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  duration: number; // en secondes
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const ExamTimer = ({ duration, onTimeUp, isPaused = false }: ExamTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;
  const isUrgent = percentage < 20;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors",
      isUrgent && "bg-red-500/10 border-red-500 animate-pulse"
    )}>
      <Clock className={cn("h-5 w-5", isUrgent && "text-red-500")} />
      <span className={cn("font-mono text-lg font-medium", isUrgent && "text-red-500")}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};