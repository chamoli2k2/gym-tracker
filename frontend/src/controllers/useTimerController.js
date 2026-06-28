import { useState, useEffect, useCallback, useRef } from 'react';

export function useRestTimer(initialSeconds = 90) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE'
    );
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration) => {
      clearTimer();
      const time = duration ?? seconds;
      setSeconds(time);
      setIsRunning(true);
      setIsFinished(false);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            setIsFinished(true);
            try {
              audioRef.current?.play();
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            } catch (_) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [seconds, clearTimer]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(
    (duration) => {
      clearTimer();
      setSeconds(duration ?? initialSeconds);
      setIsRunning(false);
      setIsFinished(false);
    },
    [initialSeconds, clearTimer]
  );

  const setDuration = useCallback(
    (duration) => {
      if (!isRunning) {
        setSeconds(duration);
        setIsFinished(false);
      }
    },
    [isRunning]
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { seconds, isRunning, isFinished, start, pause, reset, setDuration };
}
