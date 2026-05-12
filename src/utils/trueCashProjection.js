import { budgetMonthNames, budgetMonths } from "../data/constants.jsx";
import { money, parseMoney, wholeDollars } from "./format.js";

const FALLBACK_OPEN_MONTH = "May";
const FALLBACK_OPEN_YEAR = 2026;

export const LOCKED_PROJECTION_VARIANCE = {
  Jan: 850,
  Feb: 1400,
  Mar: 300,
  Apr: 2380,
  May: -520,
  Jun: 760,
  Jul: -430,
  Aug: 1180,
  Sep: 620,
  Oct: -900,
  Nov: 540,
  Dec: 1250,
};

const monthNameToBudgetMonth = Object.fromEntries(
  budgetMonths.map((month) => [budgetMonthNames[month], month])
);

export function parseChartDate(date) {
  const match = /^([A-Za-z]+)\s+\d{1,2},\s+(\d{4})$/.exec(date || "");
  if (!match) {
    return { month: FALLBACK_OPEN_MONTH, year: FALLBACK_OPEN_YEAR };
  }

  const [, monthName, year] = match;
  return {
    month: monthNameToBudgetMonth[monthName] || FALLBACK_OPEN_MONTH,
    year: Number(year) || FALLBACK_OPEN_YEAR,
  };
}

export function buildSyncedTrueCashChart(baseChart, trueCash, valueToChartY) {
  const numericValues = baseChart.values.map((value) => parseMoney(value));
  const lastMockValue = numericValues[numericValues.length - 1] || trueCash;
  const offset = trueCash - lastMockValue;
  const adjustedValues = numericValues.map((value) => value + offset);
  const firstValue = adjustedValues[0] || trueCash;
  const change = trueCash - firstValue;
  const percentChange = firstValue ? (change / firstValue) * 100 : 0;

  return {
    ...baseChart,
    value: money(trueCash),
    change: `${change >= 0 ? "+" : "-"}${money(Math.abs(change))} (${percentChange.toFixed(2)}%)`,
    points: valueToChartY
      ? baseChart.points.map((point, index) => [
          point[0],
          valueToChartY(adjustedValues[index] ?? trueCash),
        ])
      : baseChart.points,
    values: adjustedValues.map((value) => money(value)),
  };
}

function getMonthEndActuals(chart) {
  return chart.dates.reduce((actuals, date, index) => {
    const { month, year } = parseChartDate(date);
    actuals[`${year}-${month}`] = parseMoney(chart.values[index]);
    return actuals;
  }, {});
}

export function buildTrueCashProjectionSchedule({
  chart,
  incomeStreams,
  budgetRows,
  projectionAdjustments = {},
}) {
  if (!chart.supportsProjection) return [];

  const { month: openMonth, year: openYear } = parseChartDate(chart.date);
  const openMonthIndex = Math.max(0, budgetMonths.indexOf(openMonth));
  const monthEndActuals = getMonthEndActuals(chart);
  let cumulativeAdjustments = 0;
  const lockedMonths = budgetMonths.slice(0, openMonthIndex).map((month) => {
    const actualEnding = monthEndActuals[`${openYear}-${month}`];
    if (actualEnding === undefined) return null;

    cumulativeAdjustments += parseMoney(projectionAdjustments[month]);
    const projectedEnding =
      actualEnding + LOCKED_PROJECTION_VARIANCE[month] + cumulativeAdjustments;
    const variance = actualEnding - projectedEnding;

    return {
      month,
      year: openYear,
      date: `${month} ${openYear} Locked Projection`,
      value: projectedEnding,
      formattedValue: wholeDollars(projectedEnding),
      actualValue: wholeDollars(actualEnding),
      variance,
      type: "projection-history",
    };
  });
  let projectedValue =
    parseMoney(chart.values[chart.values.length - 1] || chart.value) + cumulativeAdjustments;
  const currentAndFutureMonths = budgetMonths.slice(openMonthIndex).map((month) => {
    const activeStreams = incomeStreams.filter((stream) =>
      (stream.months || budgetMonths).includes(month)
    );
    const income = activeStreams.reduce((sum, stream) => sum + parseMoney(stream.amount), 0);
    const budget = budgetRows
      .filter((category) => (category.months || budgetMonths).includes(month))
      .reduce((sum, category) => sum + Number(category.budget || 0), 0);
    const profit = income - budget;
    const adjustment = parseMoney(projectionAdjustments[month]);
    projectedValue += profit + adjustment;

    return {
      month,
      year: openYear,
      date: `${month} ${openYear} Projection`,
      value: projectedValue,
      formattedValue: wholeDollars(projectedValue),
      profit,
      adjustment,
      type: "projected",
    };
  });

  return [...lockedMonths, ...currentAndFutureMonths].filter(Boolean);
}
