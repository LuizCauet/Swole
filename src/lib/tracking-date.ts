/**
 * Get the current tracking date based on the 5 AM Eastern Time boundary.
 * Before 5 AM ET → previous day's date
 * After 5 AM ET → current day's date
 */
export function getTrackingDate(now?: Date): string {
  const d = now ?? new Date();

  // Convert to Eastern Time using Intl
  const eastern = new Date(
    d.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // If before 5 AM, subtract a day
  if (eastern.getHours() < 5) {
    eastern.setDate(eastern.getDate() - 1);
  }

  // Return YYYY-MM-DD format
  const year = eastern.getFullYear();
  const month = String(eastern.getMonth() + 1).padStart(2, "0");
  const day = String(eastern.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get tracking dates for the last N days (including today).
 */
export function getTrackingDatesRange(days: number): string[] {
  const dates: string[] = [];
  const today = getTrackingDate();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today + "T12:00:00");
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}
