/** @param {number} ms */
function formatDurationMs(ms) {
  if (ms <= 0 || Number.isNaN(ms)) return null;
  const sec = Math.round(ms / 1000);
  if (sec < 90) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 120) return `${min} min`;
  const h = Math.floor(min / 60);
  const rm = min % 60;
  return `${h}h ${rm}m`;
}

/**
 * Human-readable wall time between first scored answer and completion.
 * @param {string|Date|null|undefined} firstAnsweredAt
 * @param {string|Date|null|undefined} completedAt
 */
export function formatSessionWallDuration(firstAnsweredAt, completedAt) {
  if (!firstAnsweredAt || !completedAt) return null;
  const a = new Date(firstAnsweredAt).getTime();
  const b = new Date(completedAt).getTime();
  return formatDurationMs(b - a);
}
