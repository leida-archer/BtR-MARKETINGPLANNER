import { useState, useEffect } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  label: string;
}

export function useCountdown(targetDate: string | Date): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = target - now;
  const isPast = diff <= 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

  let label = "";
  if (days > 0) label = `T${isPast ? "+" : "-"}${days}d ${hours}h`;
  else if (hours > 0) label = `T${isPast ? "+" : "-"}${hours}h ${minutes}m`;
  else label = `T${isPast ? "+" : "-"}${minutes}m ${seconds}s`;

  return { days, hours, minutes, seconds, isPast, label };
}
