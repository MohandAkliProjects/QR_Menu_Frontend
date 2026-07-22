
export function shouldRecordView(restaurantId: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const key = `viewed_${restaurantId}_${today}`;
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  return true;
}