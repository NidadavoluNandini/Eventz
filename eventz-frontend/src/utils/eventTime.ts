// utils/eventTime.ts

// Combine date (ISO string) and time ("HH:MM") into a Date
export function combineDateTime(dateISO: string, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(dateISO);
  d.setHours(h, m, 0, 0); // local time
  return d;
}

export function getEventStatus(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): 'UPCOMING' | 'LIVE' | 'ENDED' {
  const now = new Date();

  const start = combineDateTime(startDate, startTime);
  let end = combineDateTime(endDate, endTime);

  // overnight protection: if end < start, push end by 1 day
  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'LIVE';
  return 'ENDED';
}

/**
 * Registration time window:
 * - stays open until event end datetime
 * - you can change rule to now >= start && now <= end if needed
 */
export function isRegistrationTimeOpen(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): boolean {
  const now = new Date();

  const start = combineDateTime(startDate, startTime);
  let end = combineDateTime(endDate, endTime);

  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  // registration allowed until event ends
  return now <= end;
}

export function getCountdown(
  startDate: string,
  startTime: string
): string | null {
  const start = combineDateTime(startDate, startTime);
  const diff = start.getTime() - Date.now();

  if (diff <= 0) return null;

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);

  return `${h}h ${m}m`;
}
