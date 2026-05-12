import { useState } from "react";
import { chartSets, yAxis } from "../data/constants.jsx";
import { styles } from "../styles.js";
import { buildAreaPath, buildLinePath, money } from "../utils/format.js";
import { InfoDot, MetricCard } from "./Common.jsx";

export function DashboardView({
  activeRange,
  setActiveRange,
  trueCash,
  dynamicMetrics,
  dynamicAllocations,
  dynamicBreakdown,
}) {
  const [hoverState, setHoverState] = useState(null);
  const chart = chartSets[activeRange];
  const linePath = buildLinePath(chart.points);
  const areaPath = buildAreaPath(chart.points);
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
    };
  });

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
                top: index * 42,
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
              <filter id="netWorthGlow">
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
            <circle cx="972" cy="0" r="5" fill="#8edbff" filter="url(#netWorthGlow)" />
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
                let closest = chartHoverPoints[0];
                chartHoverPoints.forEach((point) => {
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
                  "linear-gradient(to bottom, rgba(0,216,255,.08), rgba(0,216,255,.95), rgba(0,216,255,.08))",
                boxShadow: "0 0 18px rgba(0,216,255,.85)",
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
                border: "1px solid rgba(0,216,255,.55)",
                background: "linear-gradient(180deg, rgba(6,22,43,.98), rgba(2,9,22,.96))",
                borderRadius: 10,
                padding: "12px 14px",
                minWidth: 184,
                boxShadow: "0 0 28px rgba(0,136,255,.28), inset 0 0 18px rgba(0,216,255,.08)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  color: "#8feaff",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Net Worth Scan
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
                    background: "#00d8ff",
                    boxShadow: "0 0 12px rgba(0,216,255,.9)",
                  }}
                />
                {hoverState.point.value}
              </div>
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
                background: "#d9f7ff",
                boxShadow: "0 0 18px rgba(0,216,255,1)",
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
