import { useState } from "react";
import { styles } from "../styles.js";
import { money } from "../utils/format.js";
import { budgetMonths, incomeStreamSeed, yearlyOpsData } from "../data/constants.jsx";

export function OperationsBoard({ budgetRows }) {
  const [incomeStreams, setIncomeStreams] = useState(incomeStreamSeed);
  const [incomeDeleteTarget, setIncomeDeleteTarget] = useState(null);
  const [monthlyAdjustments, setMonthlyAdjustments] = useState(
    budgetMonths.reduce((acc, month) => ({ ...acc, [month]: 0 }), {})
  );
  const [otherValue, setOtherValue] = useState(0);
  const [startingSpotDate, setStartingSpotDate] = useState("2025-01-01");

  const addIncomeStream = () => {
    setIncomeStreams((streams) => {
      const nextNumber = streams.length + 1;
      return [
        ...streams,
        {
          id: `income-custom-${Date.now()}-${nextNumber}`,
          name: `New Income ${nextNumber}`,
          description: "New Source",
          amount: "$0",
          type: "Recurring",
          color: "#00f59b",
          icon: "✦",
          months: budgetMonths,
        },
      ];
    });
  };

  const toggleIncomeMonth = (index, month) => {
    setIncomeStreams((streams) =>
      streams.map((stream, streamIndex) => {
        if (streamIndex !== index) return stream;

        const currentMonths = stream.months || budgetMonths;
        const nextMonths = currentMonths.includes(month)
          ? currentMonths.filter((item) => item !== month)
          : [...currentMonths, month];

        return {
          ...stream,
          months: nextMonths.length ? nextMonths : [month],
        };
      })
    );
  };
  const parseIncomeAmount = (amount) => Number(String(amount).replace(/[^0-9.-]/g, "")) || 0;

  const dynamicYearlyOpsData = yearlyOpsData.map((month) => {
    const activeStreams = incomeStreams.filter((stream) =>
      (stream.months || budgetMonths).includes(month.month)
    );
    const income = activeStreams.reduce((sum, stream) => sum + parseIncomeAmount(stream.amount), 0);
    const oneTimeIncome = activeStreams
      .filter((stream) => stream.type === "One-Time")
      .reduce((sum, stream) => sum + parseIncomeAmount(stream.amount), 0);

    const activeBudgetCategories = budgetRows.filter((category) =>
      (category.months || budgetMonths).includes(month.month)
    );

    const budget = activeBudgetCategories.reduce(
      (sum, category) => sum + Number(category.budget || 0),
      0
    );

    const adjustment = Number(monthlyAdjustments[month.month] || 0);

    return {
      ...month,
      income,
      budget,
      baseBudget: budget,
      adjustment,
      profit: income - budget,
      recurringIncome: income - oneTimeIncome,
      oneTimeIncome,
    };
  });

  const yearlyIncome = dynamicYearlyOpsData.reduce((sum, month) => sum + month.income, 0);
  const yearlyBudget = dynamicYearlyOpsData.reduce((sum, month) => sum + month.budget, 0);
  const yearlySurplus = yearlyIncome - yearlyBudget;
  const maxValue = Math.max(
    ...dynamicYearlyOpsData.flatMap((month) => [month.income, month.budget]),
    1
  );
  const incomeOutlookRows = incomeStreams.map((stream) => {
    const monthlyValues = budgetMonths.map((month) =>
      (stream.months || budgetMonths).includes(month) ? parseIncomeAmount(stream.amount) : 0
    );
    return {
      label: stream.name,
      color: stream.color || "#00f59b",
      values: monthlyValues,
      total: monthlyValues.reduce((sum, value) => sum + value, 0),
    };
  });

  const updateMonthlyAdjustment = (month, value) => {
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const numericValue = cleaned === "" || cleaned === "-" ? 0 : Number(cleaned);

    setMonthlyAdjustments((current) => ({
      ...current,
      [month]: Number.isFinite(numericValue) ? numericValue : 0,
    }));
  };

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>
            Operations Board
          </h1>
          <p style={{ marginTop: 8, color: "#8ea8ca" }}>
            Yearly command view of income streams, budget plan, adjustments, and projected profit.
          </p>
        </div>
        <button
          style={{
            color: "#f2f7ff",
            background: "rgba(1,10,24,.55)",
            border: "1px solid rgba(54,126,220,.38)",
            borderRadius: 7,
            padding: "10px 16px",
          }}
        >
          2026
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {[
          ["Total Income", money(yearlyIncome), "#00f59b"],
          ["Total Budget", money(yearlyBudget), "#00d8ff"],
          ["Yearly Profit", money(yearlySurplus), yearlySurplus >= 0 ? "#00f59b" : "#ff5d7a"],
        ].map((item) => (
          <div key={item[0]} style={{ ...styles.panel, padding: 20 }}>
            <div
              style={{
                color: "#8fb1d9",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {item[0]}
            </div>
            <div
              style={{
                color: item[2],
                fontSize: 30,
                fontWeight: 900,
                marginTop: 12,
                textShadow: `0 0 18px ${item[2]}55`,
              }}
            >
              {item[1]}
            </div>
          </div>
        ))}

        <div style={{ ...styles.panel, padding: 20 }}>
          <div
            style={{ color: "#8fb1d9", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}
          >
            Starting Spot
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <input
              value={money(otherValue)}
              onChange={(event) => {
                const cleaned = String(event.target.value).replace(/[^0-9.-]/g, "");
                setOtherValue(cleaned === "" ? 0 : Number(cleaned));
              }}
              style={{
                color: "#eaf3ff",
                fontSize: 30,
                fontWeight: 900,
                width: "100%",
                background: "transparent",
                border: "1px solid transparent",
                borderRadius: 8,
                padding: "4px 0",
                outline: "none",
              }}
              onFocus={(event) => {
                event.currentTarget.style.border = "1px solid rgba(0,216,255,.35)";
                event.currentTarget.style.background = "rgba(0,136,255,.08)";
              }}
              onBlur={(event) => {
                event.currentTarget.style.border = "1px solid transparent";
                event.currentTarget.style.background = "transparent";
              }}
            />

            <input
              type="date"
              value={startingSpotDate}
              onChange={(event) => setStartingSpotDate(event.target.value)}
              style={{
                color: "#cfe7ff",
                fontSize: 13,
                fontWeight: 800,
                background: "rgba(0,136,255,.08)",
                border: "1px solid rgba(0,216,255,.22)",
                borderRadius: 10,
                padding: "10px 14px",
                outline: "none",
                width: 180,
                justifySelf: "center",
                textAlign: "center",
                colorScheme: "dark",
                boxShadow: "0 0 18px rgba(0,216,255,.12)",
              }}
            />
          </div>
        </div>
      </section>

      <section
        style={{
          ...styles.panel,
          padding: 22,
          marginBottom: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(0,216,255,.13), transparent 36%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: ".8fr 1.2fr",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0,136,255,.18)",
              borderRadius: 12,
              background: "rgba(0,30,70,.08)",
              minHeight: 360,
              padding: 22,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>
                  Monthly Income Streams
                </div>
                <div style={{ color: "#8ea8ca", marginTop: 8, fontSize: 16 }}>
                  Track recurring and variable income sources.
                </div>
              </div>
              <div style={{ color: "#00f59b", fontSize: 14, fontWeight: 800 }}>
                + Stable Cashflow
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 4 }}>
              {incomeStreams.map((income, index) => (
                <div
                  key={income.id}
                  style={{
                    border: "1px solid rgba(0,136,255,.16)",
                    borderRadius: 14,
                    background: "rgba(2,14,28,.72)",
                    padding: "16px 18px",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: "inset 0 0 18px rgba(0,80,160,.06)",
                  }}
                >
                  <div
                    onDoubleClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIncomeDeleteTarget({ id: income.id, name: income.name });
                    }}
                    title="Double click to delete income stream"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${income.color}22`,
                      border: `1px solid ${income.color}55`,
                      fontSize: 20,
                      boxShadow: `0 0 16px ${income.color}22`,
                      cursor: "pointer",
                    }}
                  >
                    {income.icon}
                  </div>

                  <div>
                    <div
                      style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}
                    >
                      <input
                        value={income.name}
                        onChange={(event) =>
                          setIncomeStreams((streams) =>
                            streams.map((stream, streamIndex) =>
                              streamIndex === index
                                ? { ...stream, name: event.target.value }
                                : stream
                            )
                          )
                        }
                        style={{
                          color: "white",
                          fontSize: 17,
                          fontWeight: 800,
                          background: "transparent",
                          border: "1px solid transparent",
                          borderRadius: 8,
                          padding: "4px 8px",
                          outline: "none",
                          width: 150,
                        }}
                        onFocus={(event) => {
                          event.currentTarget.style.border = "1px solid rgba(0,216,255,.38)";
                          event.currentTarget.style.background = "rgba(0,136,255,.08)";
                        }}
                        onBlur={(event) => {
                          event.currentTarget.style.border = "1px solid transparent";
                          event.currentTarget.style.background = "transparent";
                        }}
                      />
                      <input
                        value={income.description}
                        onChange={(event) =>
                          setIncomeStreams((streams) =>
                            streams.map((stream, streamIndex) =>
                              streamIndex === index
                                ? { ...stream, description: event.target.value }
                                : stream
                            )
                          )
                        }
                        style={{
                          color: "#b7d7ff",
                          fontSize: 16,
                          fontWeight: 700,
                          background: "transparent",
                          border: "1px solid transparent",
                          borderRadius: 8,
                          padding: "4px 8px",
                          outline: "none",
                          minWidth: 180,
                        }}
                        onFocus={(event) => {
                          event.currentTarget.style.border = "1px solid rgba(0,216,255,.38)";
                          event.currentTarget.style.background = "rgba(0,136,255,.08)";
                        }}
                        onBlur={(event) => {
                          event.currentTarget.style.border = "1px solid transparent";
                          event.currentTarget.style.background = "transparent";
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ color: "#00f59b", fontSize: 13, fontWeight: 800 }}>
                        {income.type}
                      </div>

                      <select
                        defaultValue=""
                        onChange={(event) => {
                          if (event.target.value) {
                            if (event.target.value === "ALL") {
                              setIncomeStreams((streams) =>
                                streams.map((stream, streamIndex) =>
                                  streamIndex === index
                                    ? { ...stream, months: budgetMonths }
                                    : stream
                                )
                              );
                            } else {
                              toggleIncomeMonth(index, event.target.value);
                            }
                            event.target.value = "";
                          }
                        }}
                        style={{
                          background: "rgba(0,136,255,.08)",
                          border: "1px solid rgba(0,216,255,.18)",
                          color: "#9fd8ff",
                          borderRadius: 6,
                          padding: "4px 7px",
                          fontSize: 10,
                          width: 94,
                          outline: "none",
                          fontWeight: 700,
                        }}
                      >
                        <option value="ALL">All Months</option>
                        <option value="">Months</option>
                        {budgetMonths.map((month) => (
                          <option
                            key={month}
                            value={month}
                            style={{ background: "#061224", color: "#eaf3ff" }}
                          >
                            {month}
                          </option>
                        ))}
                      </select>

                      <div style={{ color: "#7ea6d8", fontSize: 11, fontWeight: 700 }}>
                        {(income.months || budgetMonths).length === 12
                          ? "All months"
                          : (income.months || budgetMonths).join(", ")}
                      </div>
                    </div>
                  </div>

                  <input
                    value={income.amount}
                    onChange={(event) =>
                      setIncomeStreams((streams) =>
                        streams.map((stream, streamIndex) =>
                          streamIndex === index ? { ...stream, amount: event.target.value } : stream
                        )
                      )
                    }
                    style={{
                      color: "#eaf3ff",
                      fontSize: 22,
                      fontWeight: 900,
                      background: "transparent",
                      border: "1px solid transparent",
                      borderRadius: 8,
                      padding: "6px 10px",
                      width: 120,
                      textAlign: "right",
                      outline: "none",
                    }}
                    onFocus={(event) => {
                      event.currentTarget.style.border = "1px solid rgba(0,216,255,.38)";
                      event.currentTarget.style.background = "rgba(0,136,255,.08)";
                      event.currentTarget.style.boxShadow = "inset 0 0 18px rgba(0,136,255,.10)";
                    }}
                    onBlur={(event) => {
                      event.currentTarget.style.border = "1px solid transparent";
                      event.currentTarget.style.background = "transparent";
                      event.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addIncomeStream}
              style={{
                marginTop: 20,
                background: "linear-gradient(90deg,#0077ff,#00d8ff)",
                border: "1px solid rgba(120,220,255,.45)",
                borderRadius: 10,
                color: "white",
                padding: "12px 18px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(0,136,255,.28)",
                letterSpacing: 0.4,
                alignSelf: "center",
              }}
            >
              + Add Income Stream
            </button>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 26,
              }}
            >
              <div>
                <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>
                  Income Command Center
                </div>
                <div style={{ color: "#8ea8ca", marginTop: 8, fontSize: 16 }}>
                  Income pulls from Monthly Income Streams. Budget pulls from Budget Command Center.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  color: "#b8d3f3",
                  fontSize: 15,
                  fontWeight: 700,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <span>
                  <b
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: "#00f59b",
                      marginRight: 8,
                    }}
                  />
                  Total Income
                </span>
                <span>
                  <b
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: "#00d8ff",
                      marginRight: 8,
                    }}
                  />
                  Budget
                </span>
              </div>
            </div>

            <div
              style={{
                height: 360,
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 8,
                alignItems: "end",
                borderLeft: "1px solid rgba(0,136,255,.18)",
                borderBottom: "1px solid rgba(0,136,255,.18)",
                padding: "18px 8px 0",
              }}
            >
              {dynamicYearlyOpsData.map((month) => (
                <div
                  key={month.month}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      height: 255,
                      width: "100%",
                      display: "flex",
                      alignItems: "end",
                      justifyContent: "center",
                      gap: 3,
                    }}
                  >
                    <div
                      title={`Income ${money(month.income)}`}
                      style={{
                        width: 14,
                        height: `${(month.income / maxValue) * 100}%`,
                        borderRadius: "8px 8px 0 0",
                        background: "linear-gradient(180deg,#00f59b,#006d4a)",
                        boxShadow: "0 0 14px rgba(0,245,155,.35)",
                      }}
                    />
                    <div
                      title={`Budget ${money(month.budget)}`}
                      style={{
                        width: 14,
                        height: `${(month.budget / maxValue) * 100}%`,
                        borderRadius: "8px 8px 0 0",
                        background: "linear-gradient(180deg,#00d8ff,#005dff)",
                        boxShadow: "0 0 14px rgba(0,216,255,.35)",
                      }}
                    />
                  </div>
                  <div style={{ color: "#9fb0c9", fontSize: 16, fontWeight: 800 }}>
                    {month.month}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.panel, padding: 24, marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ color: "white", fontSize: 24, fontWeight: 900 }}>Yearly Outlook</div>
            <div style={{ color: "#8ea8ca", fontSize: 14, marginTop: 6 }}>
              Monthly income streams, budget plan, and projected profit across the full year.
            </div>
          </div>
          <div
            style={{
              color: yearlySurplus >= 0 ? "#00f59b" : "#ff5d7a",
              fontSize: 22,
              fontWeight: 950,
              textShadow:
                yearlySurplus >= 0
                  ? "0 0 16px rgba(0,245,155,.35)"
                  : "0 0 16px rgba(255,93,122,.35)",
            }}
          >
            {yearlySurplus >= 0 ? "+" : ""}
            {money(yearlySurplus)} Profit
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid rgba(0,136,255,.18)",
            borderRadius: 14,
            background: "rgba(2,14,28,.54)",
            boxShadow: "inset 0 0 22px rgba(0,80,160,.08)",
          }}
        >
          <div style={{ minWidth: 980 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(12, 1fr) 120px",
                padding: "13px 16px",
                color: "#7ea6d8",
                fontSize: 14,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                borderBottom: "1px solid rgba(0,136,255,.14)",
              }}
            >
              <div>Metric</div>
              {dynamicYearlyOpsData.map((month) => (
                <div key={month.month} style={{ textAlign: "right" }}>
                  {month.month}
                </div>
              ))}
              <div style={{ textAlign: "right", color: "#dcecff" }}>Total</div>
            </div>

            {[
              ...incomeOutlookRows,
              {
                label: "Budget",
                color: "#00d8ff",
                values: dynamicYearlyOpsData.map((month) => month.baseBudget),
                total: dynamicYearlyOpsData.reduce((sum, month) => sum + month.baseBudget, 0),
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px repeat(12, 1fr) 120px",
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(0,136,255,.08)",
                  alignItems: "center",
                }}
              >
                <div style={{ color: row.color, fontSize: 16, fontWeight: 950 }}>{row.label}</div>
                {row.values.map((value, valueIndex) =>
                  row.editable ? (
                    <input
                      key={valueIndex}
                      value={money(value)}
                      onChange={(event) =>
                        updateMonthlyAdjustment(budgetMonths[valueIndex], event.target.value)
                      }
                      style={{
                        color:
                          Number(monthlyAdjustments[budgetMonths[valueIndex]] || 0) >= 0
                            ? "#00f59b"
                            : "#ff5d7a",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 850,
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: 7,
                        padding: "4px 6px",
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                      onFocus={(event) => {
                        event.currentTarget.style.border = "1px solid rgba(255,182,93,.45)";
                        event.currentTarget.style.background = "rgba(255,182,93,.08)";
                      }}
                      onBlur={(event) => {
                        event.currentTarget.style.border = "1px solid transparent";
                        event.currentTarget.style.background = "transparent";
                      }}
                    />
                  ) : (
                    <div
                      key={valueIndex}
                      style={{
                        color: "#dcecff",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 850,
                      }}
                    >
                      {money(value)}
                    </div>
                  )
                )}
                <div
                  style={{ color: row.color, textAlign: "right", fontSize: 16, fontWeight: 950 }}
                >
                  {money(row.total)}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(12, 1fr) 120px",
                padding: "16px",
                alignItems: "center",
                background: "linear-gradient(90deg, rgba(0,136,255,.10), rgba(0,245,155,.06))",
              }}
            >
              <div style={{ color: "white", fontSize: 17, fontWeight: 950 }}>Profit</div>
              {dynamicYearlyOpsData.map((month) => {
                const profit = month.income - month.budget;
                return (
                  <div
                    key={month.month}
                    style={{
                      color: profit >= 0 ? "#00f59b" : "#ff5d7a",
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    {profit >= 0 ? "+" : ""}
                    {money(profit)}
                  </div>
                );
              })}
              <div
                style={{
                  color: yearlySurplus >= 0 ? "#00f59b" : "#ff5d7a",
                  textAlign: "right",
                  fontSize: 15,
                  fontWeight: 950,
                }}
              >
                {yearlySurplus >= 0 ? "+" : ""}
                {money(yearlySurplus)}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(12, minmax(0, 1fr)) 120px",
                padding: "16px",
                borderTop: "1px solid rgba(255,182,93,.18)",
                alignItems: "center",
                background: "rgba(255,182,93,.04)",
                columnGap: 0,
              }}
            >
              <div style={{ color: "#ffb65d", fontSize: 16, fontWeight: 950 }}>Adjustment</div>
              {budgetMonths.map((month) => (
                <div
                  key={month}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <input
                    value={String(monthlyAdjustments[month] || 0)}
                    onChange={(event) => updateMonthlyAdjustment(month, event.target.value)}
                    style={{
                      color: Number(monthlyAdjustments[month] || 0) >= 0 ? "#00f59b" : "#ff5d7a",
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 850,
                      background: "transparent",
                      border: "1px solid transparent",
                      borderRadius: 7,
                      padding: "4px 6px",
                      width: "100%",
                      minWidth: 0,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(event) => {
                      event.currentTarget.style.border = "1px solid rgba(255,182,93,.45)";
                      event.currentTarget.style.background = "rgba(255,182,93,.08)";
                    }}
                    onBlur={(event) => {
                      event.currentTarget.style.border = "1px solid transparent";
                      event.currentTarget.style.background = "transparent";
                    }}
                  />
                </div>
              ))}
              <div style={{ color: "#ffb65d", textAlign: "right", fontSize: 16, fontWeight: 950 }}>
                {money(
                  budgetMonths.reduce(
                    (sum, month) => sum + Number(monthlyAdjustments[month] || 0),
                    0
                  )
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(12, minmax(0, 1fr)) 120px",
                padding: "16px",
                alignItems: "center",
                background: "linear-gradient(90deg, rgba(0,136,255,.10), rgba(0,245,155,.06))",
                borderTop: "1px solid rgba(0,245,155,.10)",
                columnGap: 0,
              }}
            >
              <div style={{ color: "white", fontSize: 17, fontWeight: 950 }}>True Cash</div>
              {dynamicYearlyOpsData.map((month) => {
                const trueCash = month.profit + Number(monthlyAdjustments[month.month] || 0);
                return (
                  <div
                    key={month.month}
                    style={{
                      color: trueCash >= 0 ? "#00f59b" : "#ff5d7a",
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 900,
                      padding: "4px 6px",
                      boxSizing: "border-box",
                    }}
                  >
                    {trueCash >= 0 ? "+" : ""}
                    {money(trueCash)}
                  </div>
                );
              })}
              <div
                style={{
                  color:
                    yearlySurplus +
                      budgetMonths.reduce(
                        (sum, month) => sum + Number(monthlyAdjustments[month] || 0),
                        0
                      ) >=
                    0
                      ? "#00f59b"
                      : "#ff5d7a",
                  textAlign: "right",
                  fontSize: 15,
                  fontWeight: 950,
                }}
              >
                {yearlySurplus +
                  budgetMonths.reduce(
                    (sum, month) => sum + Number(monthlyAdjustments[month] || 0),
                    0
                  ) >=
                0
                  ? "+"
                  : ""}
                {money(
                  yearlySurplus +
                    budgetMonths.reduce(
                      (sum, month) => sum + Number(monthlyAdjustments[month] || 0),
                      0
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {incomeDeleteTarget ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,5,14,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              ...styles.panel,
              width: 420,
              padding: 26,
              boxShadow: "0 0 55px rgba(0,136,255,.34)",
            }}
          >
            <div
              style={{
                color: "#8feaff",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 10,
              }}
            >
              Confirm Delete
            </div>
            <div style={{ color: "white", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
              Delete {incomeDeleteTarget.name}?
            </div>
            <p style={{ color: "#a8bfdc", lineHeight: 1.55, marginTop: 14 }}>
              This removes the income stream from Monthly Income Streams. You can add a new income
              stream anytime.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setIncomeDeleteTarget(null)}
                style={{
                  background: "rgba(0,136,255,.10)",
                  border: "1px solid rgba(0,216,255,.28)",
                  color: "#d7ebff",
                  borderRadius: 8,
                  padding: "11px 16px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIncomeStreams((streams) =>
                    streams.filter((stream) => stream.id !== incomeDeleteTarget.id)
                  );
                  setIncomeDeleteTarget(null);
                }}
                style={{
                  background: "linear-gradient(90deg,#ff244d,#ff5d7a)",
                  border: "1px solid rgba(255,93,122,.55)",
                  color: "white",
                  borderRadius: 8,
                  padding: "11px 16px",
                  cursor: "pointer",
                  fontWeight: 900,
                  boxShadow: "0 0 22px rgba(255,36,77,.32)",
                }}
              >
                Delete Income
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
