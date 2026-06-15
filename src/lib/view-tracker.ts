
export function shouldRecordView(menuId: string): boolean {
  const today = new Date().toISOString().slice(0, 10); // "2026-06-15"
  const key = `viewed_${menuId}_${today}`;
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  return true;
}