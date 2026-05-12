import { styles } from "../styles.js";
import { money } from "../utils/format.js";

const accountGroups = [
  {
    title: "Checking",
    filter: (account) => account.type === "Checking",
  },
  {
    title: "Savings",
    filter: (account) => account.type === "Savings",
  },
  {
    title: "Investments",
    filter: (account) => account.type === "Investment",
  },
  {
    title: "Retirement",
    filter: (account) => account.type === "Retirement",
  },
  {
    title: "Credit Cards",
    filter: (account) => account.type === "Credit Card",
  },
  {
    title: "Other",
    filter: (account) => account.type === "Manual Cash",
  },
];

export function AccountsView({
  accounts,
  addManualAccount,
  connectMockPlaidAccount,
  openAccountTransactions,
}) {
  const linkedBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

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
          <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>Add Accounts</h1>
          <p style={{ marginTop: 8, color: "#8ea8ca" }}>
            Connect bank accounts, credit cards, investments, and cash accounts through a
            Plaid-style secure link.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={addManualAccount}
            style={{
              background: "rgba(0,136,255,.10)",
              border: "1px solid rgba(0,216,255,.35)",
              borderRadius: 10,
              color: "#eaf3ff",
              padding: "14px 20px",
              fontWeight: 800,
              boxShadow: "0 0 20px rgba(0,136,255,.18)",
              cursor: "pointer",
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
            }}
          >
            ⊕ Connect with Plaid
          </button>
        </div>
      </header>

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
              <span style={{ color: "#00aaff" }}>Manual cash stays in accounts.</span>
            </div>
            <p style={{ color: "#a8bfdc", fontSize: 16, lineHeight: 1.55, marginTop: 18 }}>
              Plaid accounts auto-feed transactions. Manual accounts are for cash, safes, private
              assets, or anything you want tracked without bank sync.
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
              {accounts.length} accounts synced
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.panel, padding: 24 }}>
        <div style={{ height: 4 }} />

        {accountGroups.map((group) => {
          const groupedAccounts = accounts.filter(group.filter);
          if (groupedAccounts.length === 0) return null;

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
                {groupedAccounts.map((account) => (
                  <div
                    onClick={() => openAccountTransactions(account.name)}
                    key={account.name}
                    style={{
                      border: "1px solid rgba(0,136,255,.22)",
                      background: "rgba(3,17,32,.72)",
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: "inset 0 0 24px rgba(0,80,160,.08)",
                      cursor: "pointer",
                      transition: "all .2s ease",
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
    </div>
  );
}
