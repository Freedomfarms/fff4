export function buildLinePath(points) {
  return "M " + points.map((p) => p[0] + " " + p[1]).join(" L ");
}

export function buildAreaPath(points) {
  return buildLinePath(points) + " L 972 300 L 0 300 Z";
}

export function money(value) {
  const number = Number(value) || 0;
  return "$" + number.toLocaleString("en-US");
}

export function cleanMoneyInput(value) {
  const cleaned = String(value).replace(/[^0-9]/g, "");
  return cleaned === "" ? 0 : Number(cleaned);
}
