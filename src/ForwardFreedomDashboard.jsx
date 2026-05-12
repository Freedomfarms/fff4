import React, { useState } from "react";
import { styles } from "./styles.js";
import { buildLinePath, buildAreaPath, money } from "./utils/format.js";
import { navMain, navTools, yAxis, chartSets, initialAccounts, mockTransactions, initialBudgetCategories, transactionCategoryOptions } from "./data/constants.jsx";
import { InfoDot, SideItem, MetricCard } from "./components/Common.jsx";
import { LandingPage } from "./components/LandingPage.jsx";
import { OperationsBoard } from "./components/OperationsBoard.jsx";
import { BudgetCommandCenter } from "./components/BudgetCommandCenter.jsx";

function ForwardFreedomDashboard() {
  const [currentView, setCurrentView] = useState("landing");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [budgetRows, setBudgetRows] = useState(initialBudgetCategories);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const connectMockPlaidAccount = () => {
    const newAccountNumber = accounts.length + 1;
    const newAccount = {
      name: `Plaid Linked Account ${newAccountNumber}`,
      type: "Checking",
      institution: "Plaid Secure Link",
      balance: 6250 + newAccountNumber * 725,
      status: "Synced",
    };
    const newTransactions = [
      { date: "May 13", merchant: "Plaid Sync Deposit", category: "Income", account: newAccount.name, amount: 1250.00 },
      { date: "May 13", merchant: "Whole Foods", category: "Groceries", account: newAccount.name, amount: -86.42 },
      { date: "May 13", merchant: "Electric Utility", category: "Utilities", account: newAccount.name, amount: -142.18 },
    ];
    setAccounts((current) => [...current, newAccount]);
    setTransactions((current) => [...newTransactions, ...current]);
    setActiveTab("Transactions");
  };

  const addManualAccount = () => {
    const manualAccountNumber = accounts.filter((account) => account.status === "Manual").length + 1;
    const newAccount = {
      name: manualAccountNumber === 1 ? "Safe Cash" : `Manual Cash Account ${manualAccountNumber}`,
      type: "Manual Cash",
      institution: "Home Safe",
      balance: 5000.00,
      status: "Manual",
    };
    setAccounts((current) => [...current, newAccount]);
  };
  const [activeRange, setActiveRange] = useState("ALL");

  const liquidCash = accounts
    .filter((account) => account.type === "Checking" || account.type === "Savings")
    .reduce((sum, account) => sum + account.balance, 0);

  const creditCardDebt = Math.abs(
    accounts
      .filter((account) => account.type === "Credit Card")
      .reduce((sum, account) => sum + account.balance, 0)
  );

  const trueCash = liquidCash - creditCardDebt;

  const investmentTotal = accounts
    .filter((account) => account.type === "Investment")
    .reduce((sum, account) => sum + account.balance, 0);

  const retirementTotal = accounts
    .filter((account) => account.type === "Retirement")
    .reduce((sum, account) => sum + account.balance, 0);

  const dynamicMetrics = [
    {
      icon: "▱",
      title: "LIQUID CASH",
      value: money(liquidCash),
      change: "$126,430.85 (8.12%)",
      red: false,
    },
    {
      icon: "▭",
      title: "CREDIT CARD DEBT",
      value: money(creditCardDebt),
      change: "$18,109.34 (4.35%)",
      red: true,
    },
    {
      icon: "⌁",
      title: "MONTHLY CASH FLOW",
      value: "$8,732.21",
      change: "$1,250.66 (16.71%)",
      red: false,
    },
    {
      icon: "▰",
      title: "INVESTMENT RETURN (YTD)",
      value: "12.45%",
      change: "3.21%",
      red: false,
    },
  ];

  const dynamicAllocations = [
    {
      name: "Investments",
      amount: money(investmentTotal),
      percent: "53.1%",
      color: "#168bff",
    },
    {
      name: "Liquid Cash",
      amount: money(liquidCash),
      percent: "20.6%",
      color: "#8b34ff",
    },
    {
      name: "Real Estate",
      amount: "$289,500.00",
      percent: "17.2%",
      color: "#18d3ff",
    },
    {
      name: "Retirement Accounts",
      amount: money(retirementTotal),
      percent: "9.0%",
      color: "#ffb65d",
    },
  ];

  const dynamicBreakdown = [
    {
      label: "Liquid Cash",
      value: money(liquidCash),
      width: "42%",
      color: "#138bff",
    },
    {
      label: "Credit Card Debt",
      value: `-${money(creditCardDebt)}`,
      width: "14%",
      color: "#ff244d",
    },
    {
      label: "Investments",
      value: money(investmentTotal),
      width: "76%",
      color: "#00d8ff",
    },
  ];
  const [hoverPoint, setHoverPoint] = useState(null);
  const chart = chartSets[activeRange];
  const linePath = buildLinePath(chart.points);
  const areaPath = buildAreaPath(chart.points);
  const chartHoverPoints = chart.points.map((point, index) => ({
    x: point[0],
    y: point[1],
    date: chart.dates[index] || chart.xAxis[index] || chart.date,
    value: chart.values[index] || chart.value,
  }));

  const makeMockAccountTransactions = (accountName) =>
    Array.from({ length: 15 }).map((_, index) => ({
      date: `May ${15 - index}`,
      merchant: ["Amazon", "Shell", "Starbucks", "Target", "Costco", "Apple", "Payroll", "Uber", "Home Depot", "Spotify", "Netflix", "CVS", "Walmart", "Delta", "Chipotle"][index % 15],
      category: ["Shopping", "Fuel", "Food", "Groceries", "Technology", "Income", "Transportation", "Home", "Subscriptions", "Health", "Travel"][index % 11],
      account: accountName,
      amount: index % 4 === 0 ? 1800 + index * 25 : -(18 + index * 37.22),
    }));

  const visibleTransactions = selectedAccount
    ? (transactions.filter((tx) => tx.account === selectedAccount).length > 0
        ? transactions.filter((tx) => tx.account === selectedAccount)
        : makeMockAccountTransactions(selectedAccount)
      ).slice(0, 15)
    : transactions.slice(0, 15);

  const openAccountTransactions = (accountName) => {
    setSelectedAccount(accountName);
    setActiveTab("Transactions");
  };

  const updateTransactionCategory = (transactionIndex, nextCategory) => {
    const transactionToUpdate = visibleTransactions[transactionIndex];
    setTransactions((current) => {
      const existingIndex = current.findIndex(
        (tx) =>
          tx.date === transactionToUpdate.date &&
          tx.merchant === transactionToUpdate.merchant &&
          tx.account === transactionToUpdate.account &&
          tx.amount === transactionToUpdate.amount
      );

      if (existingIndex >= 0) {
        return current.map((tx, index) =>
          index === existingIndex ? { ...tx, category: nextCategory } : tx
        );
      }

      return [{ ...transactionToUpdate, category: nextCategory }, ...current];
    });
  };
  if (currentView === "landing") {
    return <LandingPage enterApp={() => setCurrentView("app")} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 210, height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              

              <div style={{ marginTop: -8, textAlign: "center" }}>
                <div style={{
                  color: "#f4f8ff",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 8,
                  textTransform: "uppercase",
                }}>
                  Forward
                </div>

                <div style={{
                  color: "#00aaff",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 10,
                  marginTop: 2,
                  textTransform: "uppercase",
                  textShadow: "0 0 18px rgba(0,174,255,.55)",
                }}>
                  Freedom
                </div>

                <div style={{
                  color: "#f4f8ff",
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: 8,
                  textTransform: "uppercase",
                }}>
                  Financial
                </div>
</div>
            </div>
            </div>
          </div>

          <div style={{ color: "#9fb0c9", textTransform: "uppercase", fontSize: 12, marginBottom: 16 }}>Main</div>
          {navMain.map((item) => <SideItem key={item.label} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />)}

          <div style={{ color: "#9fb0c9", textTransform: "uppercase", fontSize: 12, marginTop: 18, marginBottom: 16 }}>Tools</div>
          {navTools.map((item) => <SideItem key={item.label} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />)}

          <button onClick={() => setCurrentView("landing")} style={{ width: "100%", marginTop: 24, marginBottom: 18, background: "linear-gradient(90deg, rgba(0,119,255,.18), rgba(0,216,255,.12))", border: "1px solid rgba(0,216,255,.28)", borderRadius: 10, padding: "14px 16px", color: "#eaf3ff", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", fontWeight: 800, letterSpacing: .4, boxShadow: "0 0 24px rgba(0,136,255,.18)" }}>
            <span style={{ fontSize: 18 }}>⌂</span>
            Back to Home
          </button>

          <div style={{ ...styles.panel, marginTop: 48, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ color: "#00d8ff", fontSize: 34, textShadow: "0 0 12px rgba(0,216,255,.9)" }}>◇</div>
              <div style={{ fontWeight: 800 }}>Forward Freedom PRIME</div>
            </div>
            <div style={{ color: "#c8d7ea", fontSize: 12, marginTop: 14 }}>All systems operational</div>
            <button style={{ marginTop: 20, color: "#d9ecff", background: "rgba(0,108,255,.08)", border: "1px solid rgba(86,157,255,.28)", borderRadius: 6, padding: "10px 18px" }}>View Status</button>
          </div>
        </aside>

        <main style={styles.main}>
          {activeTab === "Budget Command Center" ? (
            <BudgetCommandCenter transactions={transactions} budgetRows={budgetRows} setBudgetRows={setBudgetRows} />
          ) : activeTab === "Add Accounts" ? (
            <div>
              <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>Add Accounts</h1>
                  <p style={{ marginTop: 8, color: "#8ea8ca" }}>Connect bank accounts, credit cards, investments, and cash accounts through a Plaid-style secure link.</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={addManualAccount} style={{ background: "rgba(0,136,255,.10)", border: "1px solid rgba(0,216,255,.35)", borderRadius: 10, color: "#eaf3ff", padding: "14px 20px", fontWeight: 800, boxShadow: "0 0 20px rgba(0,136,255,.18)", cursor: "pointer" }}>
                    ✎ Add Manually
                  </button>
                  <button onClick={connectMockPlaidAccount} style={{ background: "linear-gradient(90deg,#00aaff,#0077ff)", border: "1px solid rgba(120,220,255,.45)", borderRadius: 10, color: "white", padding: "14px 24px", fontWeight: 800, boxShadow: "0 0 28px rgba(0,136,255,.35)", cursor: "pointer" }}>
                    ⊕ Connect with Plaid
                  </button>
                </div>
              </header>

              <section style={{ ...styles.panel, padding: 26, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(0,216,255,.16), transparent 36%)" }} />
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 24, alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#8feaff", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 13, marginBottom: 12 }}>Account Connection Hub</div>
                    <div style={{ color: "white", fontSize: 34, fontWeight: 900, lineHeight: 1.1 }}>Link with Plaid or add manually.<br /><span style={{ color: "#00aaff" }}>Manual cash stays in accounts.</span></div>
                    <p style={{ color: "#a8bfdc", fontSize: 16, lineHeight: 1.55, marginTop: 18 }}>Plaid accounts auto-feed transactions. Manual accounts are for cash, safes, private assets, or anything you want tracked without bank sync.</p>
                  </div>
                  <div style={{ border: "1px solid rgba(0,136,255,.25)", borderRadius: 18, background: "rgba(0,30,70,.26)", padding: 22 }}>
                    <div style={{ color: "#8fb1d9", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>Linked Balance</div>
                    <div style={{ color: "white", fontSize: 38, fontWeight: 900 }}>{money(accounts.reduce((sum, account) => sum + account.balance, 0))}</div>
                    <div style={{ color: "#00f59b", marginTop: 10, fontWeight: 800 }}>{accounts.length} accounts synced</div>
                  </div>
                </div>
              </section>

              <section style={{ ...styles.panel, padding: 24 }}>
                <div style={{ height: 4 }} />

                {[
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
                ].map((group) => {
                  const groupedAccounts = accounts.filter(group.filter);
                  if (groupedAccounts.length === 0) return null;

                  return (
                    <div key={group.title} style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#00d8ff", boxShadow: "0 0 12px rgba(0,216,255,.8)" }} />
                        <div style={{ color: "#dcecff", fontSize: 18, fontWeight: 800, letterSpacing: .5, textTransform: "uppercase" }}>{group.title}</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                        {groupedAccounts.map((account) => (
                          <div onClick={() => openAccountTransactions(account.name)} key={account.name} style={{ border: "1px solid rgba(0,136,255,.22)", background: "rgba(3,17,32,.72)", borderRadius: 16, padding: 18, boxShadow: "inset 0 0 24px rgba(0,80,160,.08)", cursor: "pointer", transition: "all .2s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ color: "white", fontSize: 19, fontWeight: 800 }}>{account.name}</div>
                          <div style={{ color: "#8fb1d9", marginTop: 6 }}>{account.institution} • {account.type}</div>
                        </div>
                        <div style={{ color: "#00f59b", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>{account.status}</div>
                      </div>
                      <div style={{ marginTop: 18, color: account.balance < 0 ? "#ff5d7a" : "#eaf3ff", fontSize: 28, fontWeight: 900 }}>{account.balance < 0 ? "-" : ""}{money(Math.abs(account.balance))}</div>
                    </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          ) : activeTab === "Transactions" ? (
            <div>
              <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 32, color: "white", fontWeight: 800 }}>Transactions</h1>
                  <p style={{ marginTop: 8, color: "#8ea8ca" }}>Connected accounts, live spending intelligence, and synced Plaid transaction feeds.</p>
                </div>
                <button onClick={connectMockPlaidAccount} style={{ background: "linear-gradient(90deg,#00aaff,#0077ff)", border: "1px solid rgba(120,220,255,.45)", borderRadius: 10, color: "white", padding: "14px 24px", fontWeight: 800, boxShadow: "0 0 28px rgba(0,136,255,.35)", cursor: "pointer" }}>
                  ⊕ Connect with Plaid
                </button>
              </header>

              <div style={{ ...styles.panel, padding: 24, marginBottom: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(0,216,255,.14), transparent 35%)" }} />
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                  {[
                    ["Connected Accounts", String(accounts.length)],
                    ["Monthly Spend", money(transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0))],
                    ["Pending Transactions", "8"],
                    ["Cash Inflow", money(transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0))],
                  ].map((item) => (
                    <div key={item[0]} style={{ border: "1px solid rgba(0,136,255,.22)", borderRadius: 14, background: "rgba(3,17,32,.72)", padding: 20 }}>
                      <div style={{ color: "#8fb1d9", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>{item[0]}</div>
                      <div style={{ color: "white", fontSize: 30, fontWeight: 800 }}>{item[1]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...styles.panel, padding: 24 }}>
                {selectedAccount ? (
                  <div style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,136,255,.12)", paddingBottom: 16 }}>
                    <div>
                      <div style={{ color: "#8feaff", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>Selected Account</div>
                      <div style={{ color: "white", fontSize: 26, fontWeight: 800, marginTop: 6 }}>{selectedAccount}</div>
                    </div>
                    <button onClick={() => { setSelectedAccount(null); setActiveTab("Add Accounts"); }} style={{ background: "rgba(0,136,255,.12)", border: "1px solid rgba(0,216,255,.28)", color: "#d7ebff", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}>← Back to Accounts</button>
                  </div>
                ) : null}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <div style={{ color: "white", fontSize: 22, fontWeight: 700 }}>{selectedAccount ? `${selectedAccount} Transactions` : "Live Transaction Feed"}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ background: "rgba(0,136,255,.12)", border: "1px solid rgba(0,136,255,.28)", color: "#d7ebff", borderRadius: 8, padding: "10px 14px" }}>Filter</button>
                    <button style={{ background: "rgba(0,136,255,.12)", border: "1px solid rgba(0,136,255,.28)", color: "#d7ebff", borderRadius: 8, padding: "10px 14px" }}>Export</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1.4fr 1fr 1fr 160px", padding: "0 18px 16px", color: "#7294bb", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid rgba(0,136,255,.14)" }}>
                  <div>Date</div>
                  <div>Merchant</div>
                  <div>Category</div>
                  <div>Account</div>
                  <div style={{ textAlign: "right" }}>Amount</div>
                </div>

                <div style={{ maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }}>
                  {visibleTransactions.map((tx, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "120px 1.4fr 1fr 1fr 160px", alignItems: "center", padding: "18px", borderBottom: "1px solid rgba(0,136,255,.08)", background: index % 2 === 0 ? "rgba(255,255,255,.01)" : "transparent" }}>
                      <div style={{ color: "#8fb1d9", fontSize: 14 }}>{tx.date}</div>
                      <div style={{ color: "white", fontWeight: 700 }}>{tx.merchant}</div>
                      <select value={tx.category} onChange={(event) => updateTransactionCategory(index, event.target.value)} style={{ color: "#b8d3f3", background: "rgba(0,136,255,.08)", border: "1px solid rgba(0,216,255,.18)", borderRadius: 8, padding: "8px 10px", outline: "none", width: "92%", cursor: "pointer", boxShadow: "inset 0 0 14px rgba(0,136,255,.08)" }}>
                        {transactionCategoryOptions.map((category) => (
                          <option key={category} value={category} style={{ background: "#061224", color: "#eaf3ff" }}>{category}</option>
                        ))}
                        {!transactionCategoryOptions.includes(tx.category) ? <option value={tx.category} style={{ background: "#061224", color: "#eaf3ff" }}>{tx.category}</option> : null}
                      </select>
                      <div style={{ color: "#7ebeff" }}>{tx.account}</div>
                      <div style={{ textAlign: "right", color: tx.amount > 0 ? "#00f59b" : "#ff5d7a", fontWeight: 800, fontSize: 15 }}>
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "Operations Board" ? (
            <OperationsBoard budgetRows={budgetRows} />
          ) : activeTab !== "Dashboard" ? (
            <div style={{ ...styles.panel, minHeight: "78vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(0,136,255,.12), transparent 55%)" }} />
              <div style={{ position: "relative", textAlign: "center" }}>
                <div style={{ fontSize: 72, color: "#00d8ff", textShadow: "0 0 25px rgba(0,216,255,.7)", marginBottom: 18 }}>◈</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: "white", letterSpacing: 1 }}>{activeTab}</div>
                <div style={{ marginTop: 14, color: "#8faecc", fontSize: 16 }}>Module initializing...</div>
                <div style={{ marginTop: 28, width: 260, height: 6, borderRadius: 999, background: "rgba(19,71,129,.4)", overflow: "hidden" }}>
                  <div style={{ width: "42%", height: "100%", background: "linear-gradient(90deg,#0077ff,#00d8ff)", boxShadow: "0 0 16px rgba(0,216,255,.8)" }} />
                </div>
              </div>
            </div>
          ) : (
            <>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, color: "white", fontWeight: 700 }}>{activeTab}</h1>
              <p style={{ margin: "6px 0 0", color: "#9fb0c9" }}>{activeTab === "Dashboard" ? "Real-time overview of your financial position" : `${activeTab} intelligence module`}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 20 }}>
              <span>⌕</span><span>♧</span>
              <div style={{ position: "relative", width: 48, height: 48, borderRadius: 999, border: "1px solid #148cff", display: "flex", alignItems: "center", justifyContent: "center", color: "#19d5ff", fontSize: 16, boxShadow: "0 0 22px rgba(0,120,255,.45)" }}>KP<span style={{ position: "absolute", right: 0, bottom: 0, width: 11, height: 11, borderRadius: 99, background: "#00de86" }} /></div>
            </div>
          </header>

          <section style={{ ...styles.panel, padding: 20, width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 34 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, textTransform: "uppercase" }}><span style={{ color: "#00d8ff", fontSize: 24 }}>▧</span> TRUE CASH <InfoDot /></div>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ color: "#f2f7ff", background: "rgba(1,10,24,.55)", border: "1px solid rgba(54,126,220,.38)", borderRadius: 7, padding: "10px 16px" }}>▣ &nbsp; May 12, 2023 - May 12, 2025⌄</button>
                <button style={{ color: "#f2f7ff", background: "rgba(1,10,24,.55)", border: "1px solid rgba(54,126,220,.38)", borderRadius: 7, padding: "10px 16px" }}>⇩ &nbsp; Export Report</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <div style={{ color: "white", fontSize: 38, fontWeight: 720, letterSpacing: .4 }}>{activeRange === "1Y" ? "$40,000.00" : money(trueCash)}</div>
                <div style={{ color: "#00f59b", fontSize: 14, fontWeight: 800, paddingBottom: 8 }}>↑ {chart.change}</div>
                <div style={{ color: "#cbd8ef", background: "rgba(9,31,61,.7)", borderRadius: 5, padding: "7px 10px", fontSize: 14, marginBottom: 1 }}>{chart.label}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 26, color: "#c9d8ee", fontSize: 14 }}>
                {["1M", "3M", "6M", "YTD", "1Y", "ALL"].map((range) => (
                  <button key={range} onClick={() => { setActiveRange(range); setHoverPoint(null); }} style={{ color: activeRange === range ? "#00d8ff" : "#c9d8ee", border: activeRange === range ? "1px solid rgba(0,136,255,.55)" : "1px solid transparent", background: activeRange === range ? "rgba(0,104,255,.18)" : "transparent", borderRadius: 7, padding: activeRange === range ? "12px 16px" : "12px 0", cursor: "pointer", fontSize: 14, boxShadow: activeRange === range ? "0 0 18px rgba(0,136,255,.22)" : "none" }}>{range}</button>
                ))}
                <span style={{ border: "1px solid rgba(54,126,220,.28)", borderRadius: 7, padding: "11px 13px" }}>↗</span>
              </div>
            </div>

            <div style={{ position: "relative", height: 330, paddingLeft: 56, width: "100%" }}>
              {yAxis.map((label, index) => (
                <div key={label} style={{ position: "absolute", top: index * 42, left: 0, right: 0, display: "flex", alignItems: "center", color: "#b5c7e0", fontSize: 14 }}>
                  <span style={{ width: 48, textAlign: "right" }}>{label}</span>
                  <div style={{ marginLeft: 16, height: 1, flex: 1, background: "rgba(110,168,255,.12)" }} />
                </div>
              ))}

              <svg style={{ position: "absolute", left: 64, right: -220, top: 0, height: 300, width: "calc(100% + 160px)", overflow: "visible" }} viewBox="0 0 972 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="netWorthFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#0077ff" stopOpacity="0.65" />
                    <stop offset="1" stopColor="#001b3d" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="netWorthGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <path d={areaPath} fill="url(#netWorthFill)" />
                <path d={linePath} fill="none" stroke="#04c8ff" strokeWidth="3" filter="url(#netWorthGlow)" />
                <circle cx="972" cy="0" r="5" fill="#8edbff" filter="url(#netWorthGlow)" />
              <rect x="0" y="0" width="972" height="300" fill="transparent" style={{ cursor: "crosshair" }} onMouseMove={(event) => {
                  const box = event.currentTarget.getBoundingClientRect();
                  const x = ((event.clientX - box.left) / box.width) * 972;
                  let closest = chartHoverPoints[0];
                  chartHoverPoints.forEach((point) => {
                    if (Math.abs(point.x - x) < Math.abs(closest.x - x)) closest = point;
                  });
                  setHoverPoint(closest);
                }} onMouseLeave={() => setHoverPoint(null)} />
              </svg>

              {hoverPoint ? (
                <div style={{ position: "absolute", left: `calc(64px + ${(hoverPoint.x / 972) * 100}%)`, top: 0, height: 300, width: 1, background: "linear-gradient(to bottom, rgba(0,216,255,.08), rgba(0,216,255,.95), rgba(0,216,255,.08))", boxShadow: "0 0 18px rgba(0,216,255,.85)", pointerEvents: "none" }} />
              ) : null}

              {hoverPoint ? (
                <div style={{ position: "absolute", left: `calc(64px + ${(hoverPoint.x / 972) * 100}% - 92px)`, top: Math.max(12, Math.min(210, hoverPoint.y - 76)), border: "1px solid rgba(0,216,255,.55)", background: "linear-gradient(180deg, rgba(6,22,43,.98), rgba(2,9,22,.96))", borderRadius: 10, padding: "12px 14px", minWidth: 184, boxShadow: "0 0 28px rgba(0,136,255,.28), inset 0 0 18px rgba(0,216,255,.08)", pointerEvents: "none", zIndex: 5 }}>
                  <div style={{ color: "#8feaff", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Net Worth Scan</div>
                  <div style={{ color: "white", fontSize: 15, fontWeight: 800, marginTop: 7 }}>{hoverPoint.date}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, color: "#d7ecff", fontSize: 14 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: "#00d8ff", boxShadow: "0 0 12px rgba(0,216,255,.9)" }} />{hoverPoint.value}</div>
                </div>
              ) : null}

              {hoverPoint ? (
                <div style={{ position: "absolute", left: `calc(64px + ${(hoverPoint.x / 972) * 100}% - 6px)`, top: hoverPoint.y - 6, width: 12, height: 12, borderRadius: 999, background: "#d9f7ff", boxShadow: "0 0 18px rgba(0,216,255,1)", pointerEvents: "none", zIndex: 4 }} />
              ) : null}

              

              <div style={{ position: "absolute", left: 64, right: -140, bottom: 0, display: "flex", justifyContent: "space-between", color: "#c9d8ee", fontSize: 14 }}>
                {chart.xAxis.map((label) => <span key={label}>{label}</span>)}
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
            {dynamicMetrics.map((metric) => <MetricCard key={metric.title} metric={metric} />)}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr", gap: 16, marginTop: 16 }}>
            <div style={{ ...styles.panel, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", marginBottom: 20 }}>Asset Allocation <InfoDot /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
                <div style={{ width: 144, height: 144, borderRadius: 999, background: "conic-gradient(#168bff 0 53%, #8b34ff 53% 73%, #18d3ff 73% 90%, #ffb65d 90% 99%, #80ffd9 99% 100%)", padding: 26, boxShadow: "0 0 35px rgba(0,174,255,.45)" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "#031120" }} />
                </div>
                <div style={{ flex: 1, fontSize: 14 }}>
                  {dynamicAllocations.map((item) => (
                    <div key={item.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 28, marginBottom: 19 }}>
                      <span><b style={{ display: "inline-block", width: 10, height: 10, borderRadius: 999, background: item.color, marginRight: 12 }} />{item.name}</span>
                      <span>{item.amount}</span>
                      <span>{item.percent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...styles.panel, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", marginBottom: 34 }}>Net Worth Breakdown <InfoDot /></div>
              {dynamicBreakdown.map((item) => (
                <div key={item.label} style={{ marginBottom: 26 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}><span>{item.label}</span><b>{item.value}</b></div>
                  <div style={{ height: 4, borderRadius: 999, background: "rgba(23,76,136,.38)" }}><div style={{ height: 4, borderRadius: 999, width: item.width, background: item.color }} /></div>
                </div>
              ))}
            </div>          </section>
            </>
        )}
        </main>
      </div>
    </div>
  );
}

export default ForwardFreedomDashboard;
