export function timeUntil(target: Date | string | number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const t = new Date(target).getTime();
  const ms = t - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs: ms,
  };
}

const TZ = "Europe/Paris";

export function formatPhaseDeadline(d: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(d));
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
