import { useState } from "react";
import { transactionCategoryOptions } from "../data/constants.jsx";
import { styles } from "../styles.js";
import { money } from "../utils/format.js";

function formatManualDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function parseManualAmount(value) {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TransactionsView({
  accounts,
  budgetRows,
  selectedAccount,
  visibleTransactions,
  setActiveTab,
  setSelectedAccount,
  connectMockPlaidAccount,
  addManualTransaction,
  deleteManualTransaction,
  updateTransactionCategory,
}) {
  const [manualForm, setManualForm] = useState({
    date: "2026-05-13",
    merchant: "",
    account: selectedAccount || "Manual Entry",
    amount: "",
    category: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
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
  const selectedCategory = manualForm.category || categoryOptions[0] || "Other";
  const canAddManualTransaction =
    manualForm.date &&
    manualForm.merchant.trim() &&
    manualForm.account.trim() &&
    Number.isFinite(parseManualAmount(manualForm.amount)) &&
    parseManualAmount(manualForm.amount) !== 0;

  const updateManualForm = (field, value) => {
    setManualForm((current) => ({ ...current, [field]: value }));
  };

  const submitManualTransaction = (event) => {
    event.preventDefault();
    if (!canAddManualTransaction) return;

    addManualTransaction({
      date: formatManualDate(manualForm.date),
      merchant: manualForm.merchant.trim(),
      category: selectedCategory,
      account: manualForm.account.trim(),
      amount: parseManualAmount(manualForm.amount),
    });
    setManualForm((current) => ({
      date: current.date,
      merchant: "",
      account: selectedAccount || current.account,
      amount: "",
      category: current.category,
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

      <form
        onSubmit={submitManualTransaction}
        style={{
          ...styles.panel,
          padding: 22,
          marginBottom: 18,
          border: "1px solid rgba(255,159,28,.22)",
          boxShadow: "inset 0 0 22px rgba(255,159,28,.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 900 }}>
              Manual Transaction Entry
            </div>
            <div style={{ color: "#8ea8ca", fontSize: 13, marginTop: 6 }}>
              Add cash buys, offline credit cards, future payments, or backfilled transactions.
            </div>
          </div>
          <button
            type="submit"
            disabled={!canAddManualTransaction}
            style={{
              background: canAddManualTransaction
                ? "linear-gradient(90deg,#ff9f1c,#ff6b1c)"
                : "rgba(120,130,150,.18)",
              border: canAddManualTransaction
                ? "1px solid rgba(255,208,138,.55)"
                : "1px solid rgba(160,175,200,.16)",
              borderRadius: 10,
              color: canAddManualTransaction ? "white" : "#7f93ad",
              padding: "12px 18px",
              fontWeight: 900,
              cursor: canAddManualTransaction ? "pointer" : "not-allowed",
              boxShadow: canAddManualTransaction ? "0 0 24px rgba(255,159,28,.28)" : "none",
            }}
          >
            + Add Manual Transaction
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1.2fr 1fr 1fr 130px",
            gap: 12,
            alignItems: "center",
          }}
        >
          {[
            ["date", "Date", "date"],
            ["merchant", "Merchant", "text"],
            ["account", "Account", "text"],
            ["amount", "Amount", "text"],
          ].map(([field, label, type]) => (
            <label key={field} style={{ display: "grid", gap: 7 }}>
              <span
                style={{
                  color: "#8fb1d9",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                {label}
              </span>
              <input
                type={type}
                value={manualForm[field]}
                placeholder={
                  field === "amount"
                    ? "-45.00"
                    : field === "account"
                      ? "Cash / Offline Card"
                      : field === "merchant"
                        ? "Merchant name"
                        : undefined
                }
                onChange={(event) => updateManualForm(field, event.target.value)}
                style={{
                  color: "#eaf3ff",
                  background: "rgba(0,136,255,.08)",
                  border: "1px solid rgba(0,216,255,.18)",
                  borderRadius: 8,
                  padding: "10px 11px",
                  outline: "none",
                  fontWeight: 800,
                  colorScheme: "dark",
                }}
              />
            </label>
          ))}

          <label style={{ display: "grid", gap: 7 }}>
            <span
              style={{
                color: "#8fb1d9",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                fontWeight: 900,
              }}
            >
              Category
            </span>
            <select
              value={selectedCategory}
              onChange={(event) => updateManualForm("category", event.target.value)}
              style={{
                color: "#eaf3ff",
                background: "rgba(0,136,255,.08)",
                border: "1px solid rgba(0,216,255,.18)",
                borderRadius: 8,
                padding: "10px 11px",
                outline: "none",
                fontWeight: 800,
              }}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category} style={{ background: "#061224" }}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ color: "#8ea8ca", fontSize: 12, marginTop: 12 }}>
          Use negative amounts for purchases/outflows and positive amounts for deposits, credits, or
          reimbursements.
        </div>
      </form>

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
              <div
                onDoubleClick={(event) => {
                  if (tx.source !== "manual") return;
                  event.preventDefault();
                  event.stopPropagation();
                  setDeleteTarget(tx);
                }}
                title={tx.source === "manual" ? "Double click to delete manual transaction" : ""}
                style={{
                  color: tx.source === "manual" ? "#ffd08a" : "#8fb1d9",
                  fontSize: 14,
                  cursor: tx.source === "manual" ? "pointer" : "default",
                }}
              >
                {tx.date}
              </div>
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

      {deleteTarget ? (
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
              Delete manual transaction?
            </div>
            <p style={{ color: "#a8bfdc", lineHeight: 1.55, marginTop: 14 }}>
              This removes {deleteTarget.merchant} on {deleteTarget.date}. Connected transactions
              are not affected.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setDeleteTarget(null)}
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
                  deleteManualTransaction(deleteTarget.id);
                  setDeleteTarget(null);
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
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
