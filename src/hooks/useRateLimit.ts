import { useState, useCallback, useEffect, useRef } from 'react';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';

export function useRateLimit() {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    const now = Date.now();
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    return timestamps.filter((t) => t > cutoff);
  }, [timestamps]);

  const remaining = RATE_LIMIT_MAX - cleanup().length;
  const isLimited = remaining <= 0;

  const record = useCallback(() => {
    setTimestamps((prev) => {
      const now = Date.now();
      const cutoff = now - RATE_LIMIT_WINDOW_MS;
      return [...prev.filter((t) => t > cutoff), now];
    });
  }, []);

  const setLimitedFromServer = useCallback((retryAfterSeconds: number) => {
    setSecondsLeft(retryAfterSeconds);
  }, []);

  useEffect(() => {
    if (!isLimited && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const calcSeconds = () => {
      if (secondsLeft > 0) return secondsLeft;
      const active = cleanup();
      if (active.length === 0) return 0;
      const oldest = Math.min(...active);
      return Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000);
    };

    setSecondsLeft(calcSeconds());

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimestamps((prev) => {
            const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
            return prev.filter((t) => t > cutoff);
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLimited, cleanup, secondsLeft]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return { isLimited, remaining, secondsLeft, formattedTime, record, setLimitedFromServer };
}
