export function buildLinePath(points) {
  return "M " + points.map((p) => p[0] + " " + p[1]).join(" L ");
}

export function buildAreaPath(points) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return buildLinePath(points) + ` L ${lastPoint[0]} 300 L ${firstPoint[0]} 300 Z`;
}

export function money(value) {
  const number = Number(value) || 0;
  return "$" + number.toLocaleString("en-US");
}

export function wholeDollars(value) {
  const number = Math.round(Number(value) || 0);
  const prefix = number < 0 ? "-" : "";
  return `${prefix}$${Math.abs(number).toLocaleString("en-US")}`;
}

export function parseMoney(value) {
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

export function cleanMoneyInput(value) {
  const cleaned = String(value).replace(/[^0-9]/g, "");
  return cleaned === "" ? 0 : Number(cleaned);
}
