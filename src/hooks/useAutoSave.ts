import { useEffect, useRef } from 'react';

export function useAutoSave<T>(
  data: T,
  intervalMs: number,
  saveCallback: (data: T) => Promise<void>
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if data has changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      timeoutRef.current = setTimeout(() => {
        saveCallback(data);
        previousDataRef.current = data;
      }, intervalMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, intervalMs, saveCallback]);
}
