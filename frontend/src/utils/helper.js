export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

export function getMonthsAgo(months) {
  const d = getYesterday(); // use yesterday as reference
  d.setMonth(d.getMonth() - months);
  return d;
}

export function getDaysAgo(days) {
  const d = getYesterday();
  d.setDate(d.getDate() - days);
  return d;
}

export function getYearsAgo(years) {
  const d = getYesterday();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

export function decimalFormat(value) {
  if (value == null || value === undefined || isNaN(value)) return "0.00";
  const num = parseFloat(value);
  if (num >= 1000) return num.toFixed(2);
  if (num >= 10) return num.toFixed(4);
  if (num >= 0.01) return num.toFixed(6);
  return num.toFixed(8);
}
