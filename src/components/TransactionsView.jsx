import { transactionCategoryOptions } from "../data/constants.jsx";
import { styles } from "../styles.js";
import { money } from "../utils/format.js";

export function TransactionsView({
  accounts,
  budgetRows,
  selectedAccount,
  visibleTransactions,
  setActiveTab,
  setSelectedAccount,
  connectMockPlaidAccount,
  updateTransactionCategory,
}) {
  const categoryOptions = Array.from(
    new Set([
      ...transactionCategoryOptions,
      ...budgetRows.flatMap((row) => row.transactionCategories || []),
      ...budgetRows.map((row) => row.name).filter(Boolean),
      ...visibleTransactions.map((tx) => tx.category).filter(Boolean),
    ])
  ).sort();
  const monthlySpend = visibleTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const cashInflow = visibleTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

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
          <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>Transactions</h1>
          <p style={{ marginTop: 8, color: "#8ea8ca" }}>
            Connected accounts, live spending intelligence, and synced Plaid transaction feeds.
          </p>
        </div>
        <button
          onClick={connectMockPlaidAccount}
          style={{
            background: "linear-gradient(90deg,#00aaff,#0077ff)",
            border: "1px solid rgba(120,220,255,.45)",
            borderRadius: 10,
            color: "white",
            padding: "14px 24px",
            fontWeight: 800,
            boxShadow: "0 0 28px rgba(0,136,255,.35)",
            cursor: "pointer",
          }}
        >
          ⊕ Connect with Plaid
        </button>
      </header>

      <div
        style={{
          ...styles.panel,
          padding: 24,
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
              "radial-gradient(circle at top right, rgba(0,216,255,.14), transparent 35%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 18,
          }}
        >
          {[
            ["Connected Accounts", String(accounts.length)],
            ["Monthly Spend", money(monthlySpend)],
            ["Pending Transactions", "8"],
            ["Cash Inflow", money(cashInflow)],
          ].map((item) => (
            <div
              key={item[0]}
              style={{
                border: "1px solid rgba(0,136,255,.22)",
                borderRadius: 14,
                background: "rgba(3,17,32,.72)",
                padding: 20,
              }}
            >
              <div
                style={{
                  color: "#8fb1d9",
                  fontSize: 13,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {item[0]}
              </div>
              <div style={{ color: "white", fontSize: 30, fontWeight: 800 }}>{item[1]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.panel, padding: 24 }}>
        {selectedAccount ? (
          <div
            style={{
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0,136,255,.12)",
              paddingBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: "#8feaff",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Selected Account
              </div>
              <div style={{ color: "white", fontSize: 26, fontWeight: 800, marginTop: 6 }}>
                {selectedAccount}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedAccount(null);
                setActiveTab("Add Accounts");
              }}
              style={{
                background: "rgba(0,136,255,.12)",
                border: "1px solid rgba(0,216,255,.28)",
                color: "#d7ebff",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← Back to Accounts
            </button>
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <div style={{ color: "white", fontSize: 22, fontWeight: 700 }}>
            {selectedAccount ? `${selectedAccount} Transactions` : "Live Transaction Feed"}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                background: "rgba(0,136,255,.12)",
                border: "1px solid rgba(0,136,255,.28)",
                color: "#d7ebff",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              Filter
            </button>
            <button
              style={{
                background: "rgba(0,136,255,.12)",
                border: "1px solid rgba(0,136,255,.28)",
                color: "#d7ebff",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              Export
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1.4fr 1fr 1fr 160px",
            padding: "0 18px 16px",
            color: "#7294bb",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 1,
            borderBottom: "1px solid rgba(0,136,255,.14)",
          }}
        >
          <div>Date</div>
          <div>Merchant</div>
          <div>Category</div>
          <div>Account</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>

        <div style={{ maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }}>
          {visibleTransactions.map((tx, index) => (
            <div
              key={`${tx.date}-${tx.merchant}-${tx.account}-${tx.amount}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1.4fr 1fr 1fr 160px",
                alignItems: "center",
                padding: "18px",
                borderBottom: "1px solid rgba(0,136,255,.08)",
                background: index % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent",
              }}
            >
              <div style={{ color: "#8fb1d9", fontSize: 14 }}>{tx.date}</div>
              <div style={{ color: "white", fontWeight: 700 }}>{tx.merchant}</div>
              <select
                value={tx.category}
                onChange={(event) => updateTransactionCategory(index, event.target.value)}
                style={{
                  color: "#b8d3f3",
                  background: "rgba(0,136,255,.08)",
                  border: "1px solid rgba(0,216,255,.18)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  outline: "none",
                  width: "92%",
                  cursor: "pointer",
                  boxShadow: "inset 0 0 14px rgba(0,136,255,.08)",
                }}
              >
                {categoryOptions.map((category) => (
                  <option
                    key={category}
                    value={category}
                    style={{ background: "#061224", color: "#eaf3ff" }}
                  >
                    {category}
                  </option>
                ))}
                {!categoryOptions.includes(tx.category) ? (
                  <option value={tx.category} style={{ background: "#061224", color: "#eaf3ff" }}>
                    {tx.category}
                  </option>
                ) : null}
              </select>
              <div style={{ color: "#7ebeff" }}>{tx.account}</div>
              <div
                style={{
                  textAlign: "right",
                  color: tx.amount > 0 ? "#00f59b" : "#ff5d7a",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {tx.amount > 0 ? "+" : ""}$
                {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
