/**
 * @param timestamp in seconds
 * @returns string formatted for input type datetime-local
 */
export default function timestampToDateTimeLocal(timestamp: number): string {
  const t = new Date(timestamp * 1000)
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset())
  return t.toISOString().slice(0, 16)
}
