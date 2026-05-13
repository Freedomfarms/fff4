import { styles } from "../styles.js";

export function InfoDot() {
  return (
    <span
      style={{
        color: "#8dbdff",
        border: "1px solid #5c97e8",
        borderRadius: 999,
        fontSize: 11,
        width: 16,
        height: 16,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      i
    </span>
  );
}

export function SideItem({ item, activeTab, setActiveTab }) {
  const isActive = activeTab === item.label;

  return (
    <button
      className={`sidebar-nav-button${isActive ? " sidebar-nav-button--active" : ""}`}
      onClick={() => setActiveTab(item.label)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 8,
        padding: "12px 12px",
        fontSize: 14,
        marginBottom: 8,
        width: "100%",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ width: 18, color: isActive ? "#23d7ff" : "#c9d8ee", fontSize: 18 }}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </button>
  );
}

export function MetricCard({ metric }) {
  const changeColor = metric.changeColor || (metric.red ? "#ff355d" : "#00f59b");
  const changeIcon = metric.changeIcon || (metric.red ? "↓" : "↑");
  const subLabel = metric.subLabel || "vs last 30 days";

  return (
    <div style={{ ...styles.panel, padding: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 9,
            border: "1px solid rgba(0,179,255,.55)",
            background: "rgba(0,104,255,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#23d7ff",
            fontSize: 26,
            boxShadow: "0 0 24px rgba(0,128,255,.35)",
          }}
        >
          {metric.icon}
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#c9d8ee",
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            {metric.title}
            <InfoDot />
          </div>
          <div style={{ marginTop: 12, color: "white", fontSize: 25, fontWeight: 650 }}>
            {metric.value}
          </div>
          <div
            style={{
              marginTop: 12,
              color: changeColor,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {changeIcon} {metric.change}
          </div>
          <div style={{ marginTop: 4, color: "#9fb0c9", fontSize: 14 }}>{subLabel}</div>
        </div>
      </div>
    </div>
  );
}
