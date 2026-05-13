import { useState } from "react";
import { styles } from "../styles.js";
import { money } from "../utils/format.js";

const accountGroups = [
  { title: "Checking", filter: (a) => a.type === "Checking" },
  { title: "Savings", filter: (a) => a.type === "Savings" },
  { title: "Investments", filter: (a) => a.type === "Investment" },
  { title: "Retirement", filter: (a) => a.type === "Retirement" },
  { title: "Credit Cards", filter: (a) => a.type === "Credit Card" },
  { title: "Other / Cash", filter: (a) => a.type === "Manual Cash" },
];

const ACCOUNT_TYPES = [
  "Checking",
  "Savings",
  "Credit Card",
  "Investment",
  "Retirement",
  "Manual Cash",
];

const EMPTY_FORM = { name: "", type: "Checking", institution: "", balance: "" };

function parseBalance(raw) {
  const str = String(raw).trim();
  const isNeg = str.startsWith("-");
  const digits = str.replace(/[^0-9.]/g, "");
  const n = Number(digits);
  return isNeg ? -Math.abs(n) : n;
}

export function AccountsView({
  accounts,
  addManualAccount,
  connectMockPlaidAccount,
  openAccountTransactions,
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const linkedBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const parsedBalance = parseBalance(form.balance);
  const canSubmit =
    form.name.trim().length > 0 &&
    form.type.length > 0 &&
    form.balance.trim().length > 0 &&
    Number.isFinite(parsedBalance);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const closeModal = () => {
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    addManualAccount({
      name: form.name.trim(),
      type: form.type,
      institution: form.institution.trim() || form.type,
      balance: parsedBalance,
    });
    closeModal();
  };

  const inputStyle = {
    color: "#eaf3ff",
    background: "rgba(0,136,255,.09)",
    border: "1px solid rgba(0,216,255,.22)",
    borderRadius: 9,
    padding: "11px 13px",
    outline: "none",
    fontWeight: 800,
    colorScheme: "dark",
    fontSize: 15,
    width: "100%",
  };

  const labelStyle = { display: "grid", gap: 8 };
  const labelCapStyle = {
    color: "#8fb1d9",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: 900,
  };

  return (
    <div>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>Add Accounts</h1>
          <p style={{ marginTop: 8, color: "#8ea8ca" }}>
            Connect bank accounts, credit cards, investments, and cash accounts.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={openModal}
            style={{
              background: "rgba(0,136,255,.12)",
              border: "1px solid rgba(0,216,255,.38)",
              borderRadius: 10,
              color: "#eaf3ff",
              padding: "14px 22px",
              fontWeight: 800,
              boxShadow: "0 0 20px rgba(0,136,255,.18)",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            ✎ Add Manually
          </button>
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
              fontSize: 15,
            }}
          >
            ⊕ Connect with Plaid
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          ...styles.panel,
          padding: 26,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(0,216,255,.16), transparent 36%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.1fr .9fr",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#8feaff",
                textTransform: "uppercase",
                letterSpacing: 1.6,
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              Account Connection Hub
            </div>
            <div style={{ color: "white", fontSize: 34, fontWeight: 900, lineHeight: 1.1 }}>
              Link with Plaid or add manually.
              <br />
              <span style={{ color: "#00aaff" }}>Every account in one place.</span>
            </div>
            <p style={{ color: "#a8bfdc", fontSize: 16, lineHeight: 1.55, marginTop: 18 }}>
              Plaid accounts auto-feed transactions. Manual accounts are for cash, safes, private
              assets, or anything you want tracked without a bank sync.
            </p>
          </div>
          <div
            style={{
              border: "1px solid rgba(0,136,255,.25)",
              borderRadius: 18,
              background: "rgba(0,30,70,.26)",
              padding: 22,
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
              Linked Balance
            </div>
            <div style={{ color: "white", fontSize: 38, fontWeight: 900 }}>
              {money(linkedBalance)}
            </div>
            <div style={{ color: "#00f59b", marginTop: 10, fontWeight: 800 }}>
              {accounts.length} account{accounts.length !== 1 ? "s" : ""} synced
            </div>
          </div>
        </div>
      </section>

      {/* Account list */}
      <section style={{ ...styles.panel, padding: 24 }}>
        <div style={{ height: 4 }} />
        {accountGroups.map((group) => {
          const grouped = accounts.filter(group.filter);
          if (grouped.length === 0) return null;
          return (
            <div key={group.title} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#00d8ff",
                    boxShadow: "0 0 12px rgba(0,216,255,.8)",
                  }}
                />
                <div
                  style={{
                    color: "#dcecff",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {group.title}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                {grouped.map((account) => (
                  <div
                    key={account.name}
                    onClick={() => openAccountTransactions(account.name)}
                    style={{
                      border: "1px solid rgba(0,136,255,.22)",
                      background: "rgba(3,17,32,.72)",
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: "inset 0 0 24px rgba(0,80,160,.08)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ color: "white", fontSize: 19, fontWeight: 800 }}>
                          {account.name}
                        </div>
                        <div style={{ color: "#8fb1d9", marginTop: 6 }}>
                          {account.institution} • {account.type}
                        </div>
                      </div>
                      <div
                        style={{
                          color: "#00f59b",
                          fontSize: 12,
                          fontWeight: 900,
                          textTransform: "uppercase",
                        }}
                      >
                        {account.status}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 18,
                        color: account.balance < 0 ? "#ff5d7a" : "#eaf3ff",
                        fontSize: 28,
                        fontWeight: 900,
                      }}
                    >
                      {account.balance < 0 ? "-" : ""}
                      {money(Math.abs(account.balance))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Add Account Modal ── */}
      {showModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,5,14,.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              ...styles.panel,
              width: "min(560px, 94vw)",
              padding: 28,
              boxShadow: "0 0 60px rgba(0,136,255,.38)",
              border: "1px solid rgba(0,216,255,.32)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#8feaff",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    marginBottom: 8,
                  }}
                >
                  Manual Account
                </div>
                <div style={{ color: "white", fontSize: 26, fontWeight: 900 }}>
                  Add a New Account
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "rgba(0,136,255,.10)",
                  border: "1px solid rgba(0,216,255,.25)",
                  borderRadius: 8,
                  color: "#8fb1d9",
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "grid", gap: 16 }}>
              {/* Account Name */}
              <label style={labelStyle}>
                <span style={labelCapStyle}>Account Name</span>
                <input
                  type="text"
                  value={form.name}
                  placeholder="e.g. Chase Checking, Home Safe, Cash Envelope"
                  onChange={(e) => update("name", e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </label>

              {/* Type + Institution side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={labelStyle}>
                  <span style={labelCapStyle}>Account Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                    style={inputStyle}
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: "#061224" }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={labelStyle}>
                  <span style={labelCapStyle}>Bank / Institution</span>
                  <input
                    type="text"
                    value={form.institution}
                    placeholder="Bank name or label"
                    onChange={(e) => update("institution", e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Balance */}
              <label style={labelStyle}>
                <span style={labelCapStyle}>Current Balance</span>
                <input
                  type="text"
                  value={form.balance}
                  placeholder="e.g. 5000 or -1250 for debt"
                  onChange={(e) => update("balance", e.target.value)}
                  style={{
                    ...inputStyle,
                    color: form.balance.trim().startsWith("-")
                      ? "#ff8fa3"
                      : form.balance.trim().length > 0
                        ? "#00f59b"
                        : "#eaf3ff",
                  }}
                />
                <span style={{ color: "#7294bb", fontSize: 12 }}>
                  Enter a negative number for debt / credit card balances (e.g. -2400).
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 26 }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "rgba(0,136,255,.10)",
                  border: "1px solid rgba(0,216,255,.28)",
                  color: "#d7ebff",
                  borderRadius: 9,
                  padding: "12px 20px",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  background: canSubmit
                    ? "linear-gradient(90deg,#0077ff,#00d8ff)"
                    : "rgba(120,130,150,.18)",
                  border: canSubmit
                    ? "1px solid rgba(0,216,255,.45)"
                    : "1px solid rgba(160,175,200,.16)",
                  borderRadius: 9,
                  color: canSubmit ? "white" : "#7f93ad",
                  padding: "12px 28px",
                  fontWeight: 900,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  boxShadow: canSubmit ? "0 0 22px rgba(0,136,255,.32)" : "none",
                  fontSize: 15,
                }}
              >
                Add Account →
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
