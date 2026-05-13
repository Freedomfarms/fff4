import { useState } from "react";
import {
  incomeStreamSeed,
  initialAccounts,
  initialBudgetCategories,
  mockTransactions,
} from "./data/constants.jsx";
import { styles } from "./styles.js";
import { money } from "./utils/format.js";
import { AccountsView } from "./components/AccountsView.jsx";
import { BudgetCommandCenter } from "./components/BudgetCommandCenter.jsx";
import { DashboardView } from "./components/DashboardView.jsx";
import { LandingPage } from "./components/LandingPage.jsx";
import { AppSidebar, ModulePlaceholder } from "./components/Layout.jsx";
import { OperationsBoard } from "./components/OperationsBoard.jsx";
import { TransactionsView } from "./components/TransactionsView.jsx";

function ForwardFreedomDashboard() {
  const [currentView, setCurrentView] = useState("landing");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [budgetRows, setBudgetRows] = useState(initialBudgetCategories);
  const [incomeStreams, setIncomeStreams] = useState(incomeStreamSeed);
  const [projectionAdjustments, setProjectionAdjustments] = useState({});
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeRange, setActiveRange] = useState("ALL");

  const liquidCash = accounts
    .filter(
      (account) =>
        account.type === "Checking" || account.type === "Savings" || account.type === "Manual Cash"
    )
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
      change: "$2,880.00 (5.58%)",
      red: false,
    },
    {
      icon: "▭",
      title: "CREDIT CARD DEBT",
      value: money(creditCardDebt),
      change: "$740.00 (7.07%)",
      red: true,
    },
    {
      icon: "⌁",
      title: "MONTHLY CASH FLOW",
      value: "$2,153.00",
      change: "$480.00 (28.69%)",
      red: false,
    },
    {
      icon: "▰",
      title: "INVESTMENT RETURN (YTD)",
      value: "6.25%",
      change: "1.14%",
      red: false,
    },
  ];

  const dynamicAllocations = [
    {
      name: "Investments",
      amount: money(investmentTotal),
      percent: "19.2%",
      color: "#168bff",
    },
    {
      name: "Liquid Cash",
      amount: money(liquidCash),
      percent: "21.5%",
      color: "#8b34ff",
    },
    {
      name: "Real Estate",
      amount: "$82,000.00",
      percent: "32.4%",
      color: "#18d3ff",
    },
    {
      name: "Retirement Accounts",
      amount: money(retirementTotal),
      percent: "26.9%",
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
      {
        date: "May 13, 2026",
        merchant: "Plaid Sync Deposit",
        category: "Income",
        account: newAccount.name,
        amount: 1250.0,
      },
      {
        date: "May 13, 2026",
        merchant: "Whole Foods",
        category: "Groceries",
        account: newAccount.name,
        amount: -86.42,
      },
      {
        date: "May 13, 2026",
        merchant: "Electric Utility",
        category: "Utilities",
        account: newAccount.name,
        amount: -142.18,
      },
    ];

    setAccounts((current) => [...current, newAccount]);
    setTransactions((current) => [...newTransactions, ...current]);
    setActiveTab("Transactions");
  };

  const addManualAccount = () => {
    const manualAccountNumber =
      accounts.filter((account) => account.status === "Manual").length + 1;
    const newAccount = {
      name: manualAccountNumber === 1 ? "Safe Cash" : `Manual Cash Account ${manualAccountNumber}`,
      type: "Manual Cash",
      institution: "Home Safe",
      balance: 5000.0,
      status: "Manual",
    };

    setAccounts((current) => [...current, newAccount]);
  };

  const makeMockAccountTransactions = (accountName) =>
    Array.from({ length: 15 }).map((_, index) => ({
      date: `May ${15 - index}, 2026`,
      merchant: [
        "Amazon",
        "Shell",
        "Starbucks",
        "Target",
        "Costco",
        "Apple",
        "Payroll",
        "Uber",
        "Home Depot",
        "Spotify",
        "Netflix",
        "CVS",
        "Walmart",
        "Delta",
        "Chipotle",
      ][index % 15],
      category: [
        "Shopping",
        "Fuel",
        "Food",
        "Groceries",
        "Technology",
        "Income",
        "Transportation",
        "Home",
        "Subscriptions",
        "Health",
        "Travel",
      ][index % 11],
      account: accountName,
      amount: index % 4 === 0 ? 1800 + index * 25 : -(18 + index * 37.22),
    }));

  const selectedTransactions = selectedAccount
    ? transactions.filter((tx) => tx.account === selectedAccount)
    : [];

  const visibleTransactions = selectedAccount
    ? (selectedTransactions.length > 0
        ? selectedTransactions
        : makeMockAccountTransactions(selectedAccount)
      ).slice(0, 15)
    : transactions.slice(0, 15);

  const openAccountTransactions = (accountName) => {
    setSelectedAccount(accountName);
    setActiveTab("Transactions");
  };

  const addManualTransaction = (transaction) => {
    setTransactions((current) => [
      {
        ...transaction,
        id: `manual-tx-${Date.now()}-${current.length + 1}`,
        source: "manual",
      },
      ...current,
    ]);
  };

  const deleteManualTransaction = (transactionId) => {
    setTransactions((current) =>
      current.filter(
        (transaction) => transaction.id !== transactionId || transaction.source !== "manual"
      )
    );
  };

  const updateTransactionCategory = (transactionIndex, nextCategory) => {
    const transactionToUpdate = visibleTransactions[transactionIndex];

    setTransactions((current) => {
      if (transactionToUpdate.id) {
        return current.map((tx) =>
          tx.id === transactionToUpdate.id ? { ...tx, category: nextCategory } : tx
        );
      }

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
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackHome={() => setCurrentView("landing")}
        />

        <main style={styles.main}>
          {activeTab === "Dashboard" ? (
            <DashboardView
              activeRange={activeRange}
              setActiveRange={setActiveRange}
              trueCash={trueCash}
              incomeStreams={incomeStreams}
              budgetRows={budgetRows}
              projectionAdjustments={projectionAdjustments}
              dynamicMetrics={dynamicMetrics}
              dynamicAllocations={dynamicAllocations}
              dynamicBreakdown={dynamicBreakdown}
            />
          ) : activeTab === "Budget Command Center" ? (
            <BudgetCommandCenter
              transactions={transactions}
              budgetRows={budgetRows}
              setBudgetRows={setBudgetRows}
            />
          ) : activeTab === "Operations Board" ? (
            <OperationsBoard
              budgetRows={budgetRows}
              incomeStreams={incomeStreams}
              setIncomeStreams={setIncomeStreams}
              trueCash={trueCash}
              projectionAdjustments={projectionAdjustments}
              setProjectionAdjustments={setProjectionAdjustments}
            />
          ) : activeTab === "Add Accounts" ? (
            <AccountsView
              accounts={accounts}
              addManualAccount={addManualAccount}
              connectMockPlaidAccount={connectMockPlaidAccount}
              openAccountTransactions={openAccountTransactions}
            />
          ) : activeTab === "Transactions" ? (
            <TransactionsView
              accounts={accounts}
              budgetRows={budgetRows}
              selectedAccount={selectedAccount}
              visibleTransactions={visibleTransactions}
              setActiveTab={setActiveTab}
              setSelectedAccount={setSelectedAccount}
              connectMockPlaidAccount={connectMockPlaidAccount}
              addManualTransaction={addManualTransaction}
              deleteManualTransaction={deleteManualTransaction}
              updateTransactionCategory={updateTransactionCategory}
            />
          ) : (
            <ModulePlaceholder activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}

export default ForwardFreedomDashboard;
