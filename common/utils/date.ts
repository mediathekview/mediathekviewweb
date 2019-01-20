export function isValidDate(year: number, month: number, date?: number): boolean {
  const d = new Date(year, month, date);

  const dateValid = d.getDate() == date;
  const monthValid = d.getMonth() == month;
  const yearValid = d.getFullYear() == year;
  const valid = dateValid && monthValid && yearValid;

  return valid;
}
