import { useState } from "react";
import { budgetMonths, chartSets, yAxis } from "../data/constants.jsx";
import { styles } from "../styles.js";
import { buildAreaPath, buildLinePath, money, parseMoney } from "../utils/format.js";
import { InfoDot, MetricCard } from "./Common.jsx";

const CURRENT_OPEN_MONTH = "May";
const TRUE_CASH_CHART_MAX = 100000;
const CHART_HEIGHT = 300;
const MONTH_END_X = {
  May: 401,
  Jun: 481,
  Jul: 563,
  Aug: 646,
  Sep: 726,
  Oct: 809,
  Nov: 889,
  Dec: 972,
};

function trueCashToChartY(value) {
  return Math.max(
    0,
    Math.min(CHART_HEIGHT, CHART_HEIGHT - (value / TRUE_CASH_CHART_MAX) * CHART_HEIGHT)
  );
}

function buildCurrentTrueCashChart(baseChart, trueCash) {
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
    points: baseChart.points.map((point, index) => [
      point[0],
      trueCashToChartY(adjustedValues[index] ?? trueCash),
    ]),
    values: adjustedValues.map((value) => money(value)),
  };
}

function buildProjectionAreaPath(points) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return (
    buildLinePath(points) +
    ` L ${lastPoint[0]} ${CHART_HEIGHT} L ${firstPoint[0]} ${CHART_HEIGHT} Z`
  );
}

function buildProjectedTrueCashPoints({ chart, incomeStreams, budgetRows }) {
  if (!chart.supportsProjection) return [];

  const actualEndValue = parseMoney(chart.values[chart.values.length - 1] || chart.value);
  const currentMonthIndex = budgetMonths.indexOf(CURRENT_OPEN_MONTH);
  const projectionMonths = budgetMonths
    .slice(currentMonthIndex)
    .filter((month) => MONTH_END_X[month]);
  let projectedValue = actualEndValue;

  return projectionMonths.map((month) => {
    const activeStreams = incomeStreams.filter((stream) =>
      (stream.months || budgetMonths).includes(month)
    );
    const income = activeStreams.reduce((sum, stream) => sum + parseMoney(stream.amount), 0);
    const budget = budgetRows
      .filter((category) => (category.months || budgetMonths).includes(month))
      .reduce((sum, category) => sum + Number(category.budget || 0), 0);
    const profit = income - budget;
    projectedValue += profit;

    return {
      x: MONTH_END_X[month],
      y: trueCashToChartY(projectedValue),
      date: `${month} 2026 Projection`,
      value: money(projectedValue),
      profit,
      type: "projected",
    };
  });
}

export function DashboardView({
  activeRange,
  setActiveRange,
  trueCash,
  incomeStreams,
  budgetRows,
  dynamicMetrics,
  dynamicAllocations,
  dynamicBreakdown,
}) {
  const [hoverState, setHoverState] = useState(null);
  const chart = buildCurrentTrueCashChart(chartSets[activeRange], trueCash);
  const linePath = buildLinePath(chart.points);
  const areaPath = buildAreaPath(chart.points);
  const projectedTrueCashPoints = buildProjectedTrueCashPoints({
    chart,
    incomeStreams,
    budgetRows,
  });
  const projectionPath =
    projectedTrueCashPoints.length > 0
      ? buildLinePath([
          chart.points[chart.points.length - 1],
          ...projectedTrueCashPoints.map((point) => [point.x, point.y]),
        ])
      : "";
  const projectionAreaPath =
    projectedTrueCashPoints.length > 0
      ? buildProjectionAreaPath([
          chart.points[chart.points.length - 1],
          ...projectedTrueCashPoints.map((point) => [point.x, point.y]),
        ])
      : "";
  const chartHoverPoints = chart.points.map((point, index) => {
    const labelIndex =
      chart.dates.length === chart.points.length
        ? index
        : Math.round((index / Math.max(chart.points.length - 1, 1)) * (chart.dates.length - 1));

    return {
      x: point[0],
      y: point[1],
      date: chart.dates[labelIndex] || chart.xAxis[labelIndex] || chart.date,
      value: chart.values[labelIndex] || chart.value,
      type: "actual",
    };
  });
  const combinedHoverPoints = [
    ...chartHoverPoints,
    ...projectedTrueCashPoints.map((point) => ({
      x: point.x,
      y: point.y,
      date: point.date,
      value: point.value,
      profit: point.profit,
      type: point.type,
    })),
  ];

  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, color: "white", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p style={{ margin: "6px 0 0", color: "#9fb0c9" }}>
            Real-time overview of your financial position
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 20 }}>
          <span>⌕</span>
          <span>♧</span>
          <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              borderRadius: 999,
              border: "1px solid #148cff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#19d5ff",
              fontSize: 16,
              boxShadow: "0 0 22px rgba(0,120,255,.45)",
            }}
          >
            KP
            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 11,
                height: 11,
                borderRadius: 99,
                background: "#00de86",
              }}
            />
          </div>
        </div>
      </header>

      <section style={{ ...styles.panel, padding: 20, width: "100%", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 34,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, textTransform: "uppercase" }}
          >
            <span style={{ color: "#00d8ff", fontSize: 24 }}>▧</span> TRUE CASH <InfoDot />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                color: "#f2f7ff",
                background: "rgba(1,10,24,.55)",
                border: "1px solid rgba(54,126,220,.38)",
                borderRadius: 7,
                padding: "10px 16px",
              }}
            >
              ▣ &nbsp; {chart.dateRange}⌄
            </button>
            <button
              style={{
                color: "#f2f7ff",
                background: "rgba(1,10,24,.55)",
                border: "1px solid rgba(54,126,220,.38)",
                borderRadius: 7,
                padding: "10px 16px",
              }}
            >
              ⇩ &nbsp; Export Report
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <div style={{ color: "white", fontSize: 38, fontWeight: 720, letterSpacing: 0.4 }}>
              {money(trueCash)}
            </div>
            <div style={{ color: "#00f59b", fontSize: 14, fontWeight: 800, paddingBottom: 8 }}>
              ↑ {chart.change}
            </div>
            <div
              style={{
                color: "#cbd8ef",
                background: "rgba(9,31,61,.7)",
                borderRadius: 5,
                padding: "7px 10px",
                fontSize: 14,
                marginBottom: 1,
              }}
            >
              {chart.label}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              color: "#c9d8ee",
              fontSize: 14,
            }}
          >
            {["1M", "3M", "6M", "YTD", "1Y", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setActiveRange(range);
                  setHoverState(null);
                }}
                style={{
                  color: activeRange === range ? "#00d8ff" : "#c9d8ee",
                  border:
                    activeRange === range
                      ? "1px solid rgba(0,136,255,.55)"
                      : "1px solid transparent",
                  background: activeRange === range ? "rgba(0,104,255,.18)" : "transparent",
                  borderRadius: 7,
                  padding: activeRange === range ? "12px 16px" : "12px 0",
                  cursor: "pointer",
                  fontSize: 14,
                  boxShadow: activeRange === range ? "0 0 18px rgba(0,136,255,.22)" : "none",
                }}
              >
                {range}
              </button>
            ))}
            <span
              style={{
                border: "1px solid rgba(54,126,220,.28)",
                borderRadius: 7,
                padding: "11px 13px",
              }}
            >
              ↗
            </span>
          </div>
        </div>

        <div style={{ position: "relative", height: 330, paddingLeft: 56, width: "100%" }}>
          {yAxis.map((label, index) => (
            <div
              key={label}
              style={{
                position: "absolute",
                top: (index / Math.max(yAxis.length - 1, 1)) * CHART_HEIGHT,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                color: "#b5c7e0",
                fontSize: 14,
              }}
            >
              <span style={{ width: 48, textAlign: "right" }}>{label}</span>
              <div
                style={{ marginLeft: 16, height: 1, flex: 1, background: "rgba(110,168,255,.12)" }}
              />
            </div>
          ))}

          <svg
            style={{
              position: "absolute",
              left: 64,
              top: 0,
              height: 300,
              width: "calc(100% - 64px)",
              overflow: "visible",
            }}
            viewBox="0 0 972 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="netWorthFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#0077ff" stopOpacity="0.65" />
                <stop offset="1" stopColor="#001b3d" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="projectedTrueCashFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ff9f1c" stopOpacity="0.42" />
                <stop offset="1" stopColor="#3a1700" stopOpacity="0.03" />
              </linearGradient>
              <filter id="netWorthGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="projectedTrueCashGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={areaPath} fill="url(#netWorthFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#04c8ff"
              strokeWidth="3"
              filter="url(#netWorthGlow)"
            />
            <circle
              cx={chart.points[chart.points.length - 1][0]}
              cy={chart.points[chart.points.length - 1][1]}
              r="5"
              fill="#8edbff"
              filter="url(#netWorthGlow)"
            />
            {projectedTrueCashPoints.length > 0 ? (
              <>
                <path d={projectionAreaPath} fill="url(#projectedTrueCashFill)" />
                <path
                  d={projectionPath}
                  fill="none"
                  stroke="#ff9f1c"
                  strokeWidth="3"
                  filter="url(#projectedTrueCashGlow)"
                />
                {projectedTrueCashPoints.map((point) => (
                  <circle
                    key={point.date}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#ffd08a"
                    filter="url(#projectedTrueCashGlow)"
                  />
                ))}
              </>
            ) : null}
            <rect
              x="0"
              y="0"
              width="972"
              height="300"
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseMove={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const cursorX = Math.min(Math.max(event.clientX - box.left, 0), box.width);
                const x = (cursorX / box.width) * 972;
                let closest = combinedHoverPoints[0];
                combinedHoverPoints.forEach((point) => {
                  if (Math.abs(point.x - x) < Math.abs(closest.x - x)) closest = point;
                });
                setHoverState({
                  cursorX: cursorX + 64,
                  pointX: (closest.x / 972) * box.width + 64,
                  pointY: closest.y,
                  point: closest,
                });
              }}
              onMouseLeave={() => setHoverState(null)}
            />
          </svg>

          {hoverState ? (
            <div
              style={{
                position: "absolute",
                left: hoverState.cursorX,
                top: 0,
                height: 300,
                width: 1,
                background:
                  hoverState.point.type === "projected"
                    ? "linear-gradient(to bottom, rgba(255,159,28,.08), rgba(255,159,28,.95), rgba(255,159,28,.08))"
                    : "linear-gradient(to bottom, rgba(0,216,255,.08), rgba(0,216,255,.95), rgba(0,216,255,.08))",
                boxShadow:
                  hoverState.point.type === "projected"
                    ? "0 0 18px rgba(255,159,28,.85)"
                    : "0 0 18px rgba(0,216,255,.85)",
                pointerEvents: "none",
              }}
            />
          ) : null}

          {hoverState ? (
            <div
              style={{
                position: "absolute",
                left: `min(max(${hoverState.cursorX - 92}px, 64px), calc(100% - 184px))`,
                top: Math.max(12, Math.min(210, hoverState.pointY - 76)),
                border:
                  hoverState.point.type === "projected"
                    ? "1px solid rgba(255,159,28,.62)"
                    : "1px solid rgba(0,216,255,.55)",
                background: "linear-gradient(180deg, rgba(6,22,43,.98), rgba(2,9,22,.96))",
                borderRadius: 10,
                padding: "12px 14px",
                minWidth: 184,
                boxShadow:
                  hoverState.point.type === "projected"
                    ? "0 0 28px rgba(255,159,28,.24), inset 0 0 18px rgba(255,159,28,.08)"
                    : "0 0 28px rgba(0,136,255,.28), inset 0 0 18px rgba(0,216,255,.08)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  color: hoverState.point.type === "projected" ? "#ffd08a" : "#8feaff",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {hoverState.point.type === "projected" ? "Projected True Cash" : "True Cash Scan"}
              </div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 800, marginTop: 7 }}>
                {hoverState.point.date}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 9,
                  color: "#d7ecff",
                  fontSize: 14,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: hoverState.point.type === "projected" ? "#ff9f1c" : "#00d8ff",
                    boxShadow:
                      hoverState.point.type === "projected"
                        ? "0 0 12px rgba(255,159,28,.9)"
                        : "0 0 12px rgba(0,216,255,.9)",
                  }}
                />
                {hoverState.point.value}
              </div>
              {hoverState.point.type === "projected" ? (
                <div style={{ color: "#a8bfdc", fontSize: 12, marginTop: 7 }}>
                  Monthly profit: {hoverState.point.profit >= 0 ? "+" : ""}
                  {money(hoverState.point.profit)}
                </div>
              ) : null}
            </div>
          ) : null}

          {hoverState ? (
            <div
              style={{
                position: "absolute",
                left: hoverState.pointX - 6,
                top: hoverState.pointY - 6,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: hoverState.point.type === "projected" ? "#ffd08a" : "#d9f7ff",
                boxShadow:
                  hoverState.point.type === "projected"
                    ? "0 0 18px rgba(255,159,28,1)"
                    : "0 0 18px rgba(0,216,255,1)",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
          ) : null}

          <div
            style={{
              position: "absolute",
              left: 64,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "space-between",
              color: "#c9d8ee",
              fontSize: 14,
            }}
          >
            {chart.xAxis.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          {projectedTrueCashPoints.length > 0 ? (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -4,
                display: "flex",
                gap: 18,
                color: "#a8bfdc",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              <span>
                <b
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: "#00d8ff",
                    boxShadow: "0 0 10px rgba(0,216,255,.8)",
                    marginRight: 8,
                  }}
                />
                Actual
              </span>
              <span>
                <b
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: "#ff9f1c",
                    boxShadow: "0 0 10px rgba(255,159,28,.8)",
                    marginRight: 8,
                  }}
                />
                Projected
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}
      >
        {dynamicMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr", gap: 16, marginTop: 16 }}
      >
        <div style={{ ...styles.panel, padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Asset Allocation <InfoDot />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
            <div
              style={{
                width: 144,
                height: 144,
                borderRadius: 999,
                background:
                  "conic-gradient(#168bff 0 53%, #8b34ff 53% 73%, #18d3ff 73% 90%, #ffb65d 90% 99%, #80ffd9 99% 100%)",
                padding: 26,
                boxShadow: "0 0 35px rgba(0,174,255,.45)",
              }}
            >
              <div
                style={{ width: "100%", height: "100%", borderRadius: 999, background: "#031120" }}
              />
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>
              {dynamicAllocations.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 28,
                    marginBottom: 19,
                  }}
                >
                  <span>
                    <b
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: item.color,
                        marginRight: 12,
                      }}
                    />
                    {item.name}
                  </span>
                  <span>{item.amount}</span>
                  <span>{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...styles.panel, padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textTransform: "uppercase",
              marginBottom: 34,
            }}
          >
            Net Worth Breakdown <InfoDot />
          </div>
          {dynamicBreakdown.map((item) => (
            <div key={item.label} style={{ marginBottom: 26 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(23,76,136,.38)" }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 999,
                    width: item.width,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
