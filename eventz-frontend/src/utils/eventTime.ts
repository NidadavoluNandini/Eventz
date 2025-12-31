export function combineDateTime(dateISO: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(dateISO);
  d.setHours(h, m, 0, 0); // LOCAL TIME
  return d;
}

export function getEventStatus(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): "UPCOMING" | "LIVE" | "ENDED" {
  const now = new Date();

  const start = combineDateTime(startDate, startTime);
  let end = combineDateTime(endDate, endTime);

  // ✅ FIX: overnight event protection
  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "LIVE";
  return "ENDED";
}

export function isRegistrationOpen(
  startDate: string,
  startTime: string
) {
  const start = combineDateTime(startDate, startTime);
  return new Date() < start;
}

export function getCountdown(
  startDate: string,
  startTime: string
) {
  const start = combineDateTime(startDate, startTime);
  const diff = start.getTime() - Date.now();

  if (diff <= 0) return null;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);

  return `${h}h ${m}m`;
}
