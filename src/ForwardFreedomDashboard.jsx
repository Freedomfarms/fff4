import { useEffect, useState } from "react";
import {
  budgetMonths,
  incomeStreamSeed,
  initialAccounts,
  initialBudgetCategories,
  initialSubscriptions,
  mockTransactions,
} from "./data/constants.jsx";
import { styles } from "./styles.js";
import { money, parseMoney } from "./utils/format.js";
import {
  calculateCryptoBalance,
  fetchCryptoQuotes,
  isCryptoPriceStale,
} from "./utils/cryptoPricing.js";
import { AccountsView } from "./components/AccountsView.jsx";
import { BudgetCommandCenter } from "./components/BudgetCommandCenter.jsx";
import { DashboardView } from "./components/DashboardView.jsx";
import { ForecastLab } from "./components/ForecastLab.jsx";
import { LandingPage } from "./components/LandingPage.jsx";
import { AppSidebar, ModulePlaceholder } from "./components/Layout.jsx";
import { OperationsBoard } from "./components/OperationsBoard.jsx";
import { RecurringSubscriptions } from "./components/RecurringSubscriptions.jsx";
import { TransactionsView } from "./components/TransactionsView.jsx";

function roundCurrency(value) {
  return Number((Number(value) || 0).toFixed(2));
}

function normalizeCryptoPrice(value) {
  return Number((Number(value) || 0).toFixed(8));
}

const LIQUID_ACCOUNT_TYPES = new Set(["Checking", "Savings", "Manual Cash"]);
const CRYPTO_PRICE_SOURCE = "CoinGecko";

function ForwardFreedomDashboard() {
  const [currentView, setCurrentView] = useState("landing");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [budgetRows, setBudgetRows] = useState(initialBudgetCategories);
  const [incomeStreams, setIncomeStreams] = useState(incomeStreamSeed);
  const [projectionAdjustments, setProjectionAdjustments] = useState({});
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeRange, setActiveRange] = useState("ALL");

  const liquidCash = accounts
    .filter((account) => LIQUID_ACCOUNT_TYPES.has(account.type))
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

  const cryptoTotal = accounts
    .filter((account) => account.type === "Crypto")
    .reduce((sum, account) => sum + account.balance, 0);

  const preciousMetalsTotal = accounts
    .filter((account) => account.type === "Precious Metals")
    .reduce((sum, account) => sum + account.balance, 0);

  const realEstateTotal = accounts
    .filter((account) => account.type === "Real Estate")
    .reduce((sum, account) => sum + account.balance, 0);

  const retirementTotal = accounts
    .filter((account) => account.type === "Retirement")
    .reduce((sum, account) => sum + account.balance, 0);

  const currentMonth = "May";
  const currentMonthIncome = incomeStreams
    .filter((s) => (s.months || budgetMonths).includes(currentMonth))
    .reduce((sum, s) => sum + parseMoney(s.amount), 0);
  const currentMonthBudget = budgetRows
    .filter((r) => (r.months || budgetMonths).includes(currentMonth))
    .reduce((sum, r) => sum + Number(r.budget || 0), 0);
  const monthlyFlow = currentMonthIncome - currentMonthBudget;

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
      value: money(monthlyFlow),
      change: monthlyFlow >= 0 ? "Projected surplus" : "Projected deficit",
      red: monthlyFlow < 0,
    },
    {
      icon: "▰",
      title: "INVESTMENT RETURN (YTD)",
      value: "6.25%",
      change: "1.14%",
      red: false,
    },
  ];

  const totalNetWorth = Math.max(
    trueCash + investmentTotal + cryptoTotal + preciousMetalsTotal + realEstateTotal + retirementTotal,
    1
  );
  const pct = (v) => `${((v / totalNetWorth) * 100).toFixed(1)}%`;

  const dynamicAllocations = [
    {
      name: "True Cash",
      amount: money(trueCash),
      percent: pct(trueCash),
      color: "#8b34ff",
      valueNumber: trueCash,
    },
    {
      name: "Investments",
      amount: money(investmentTotal),
      percent: pct(investmentTotal),
      color: "#168bff",
      valueNumber: investmentTotal,
    },
    {
      name: "Crypto",
      amount: money(cryptoTotal),
      percent: pct(cryptoTotal),
      color: "#00d8ff",
      valueNumber: cryptoTotal,
    },
    {
      name: "Precious Metals",
      amount: money(preciousMetalsTotal),
      percent: pct(preciousMetalsTotal),
      color: "#f6c453",
      valueNumber: preciousMetalsTotal,
    },
    {
      name: "Real Estate",
      amount: money(realEstateTotal),
      percent: pct(realEstateTotal),
      color: "#18d3ff",
      valueNumber: realEstateTotal,
    },
    {
      name: "Retirement",
      amount: money(retirementTotal),
      percent: pct(retirementTotal),
      color: "#ffb65d",
      valueNumber: retirementTotal,
    },
  ];

  const breakdownMax = Math.max(liquidCash, creditCardDebt, investmentTotal, retirementTotal, 1);
  const bpct = (v) => `${Math.round((v / breakdownMax) * 100)}%`;

  const dynamicBreakdown = [
    {
      label: "Liquid Cash",
      value: money(liquidCash),
      width: bpct(liquidCash),
      color: "#138bff",
    },
    {
      label: "Credit Card Debt",
      value: `-${money(creditCardDebt)}`,
      width: bpct(creditCardDebt),
      color: "#ff244d",
    },
    {
      label: "Investments",
      value: money(investmentTotal),
      width: bpct(investmentTotal),
      color: "#00d8ff",
    },
  ];

  useEffect(() => {
    const staleCryptoAccounts = accounts.filter(
      (account) =>
        account.type === "Crypto" &&
        account.cryptoAssetId &&
        isCryptoPriceStale(account.lastPriceUpdatedAt)
    );

    if (staleCryptoAccounts.length === 0) return;

    let cancelled = false;
    const uniqueAssetIds = [...new Set(staleCryptoAccounts.map((account) => account.cryptoAssetId))];

    fetchCryptoQuotes(uniqueAssetIds)
      .then((quotes) => {
        if (cancelled || Object.keys(quotes).length === 0) return;

        setAccounts((current) => {
          let changed = false;

          const nextAccounts = current.map((account) => {
            if (account.type !== "Crypto" || !account.cryptoAssetId) return account;

            const quote = quotes[account.cryptoAssetId];
            if (!quote) return account;

            const nextPriceUsd = normalizeCryptoPrice(quote.priceUsd);
            const nextBalance = calculateCryptoBalance(account.quantity, nextPriceUsd);
            const nextUpdatedAt = quote.lastUpdatedAt;

            if (
              account.lastPriceUsd === nextPriceUsd &&
              account.balance === nextBalance &&
              account.lastPriceUpdatedAt === nextUpdatedAt
            ) {
              return account;
            }

            changed = true;
            return {
              ...account,
              lastPriceUsd: nextPriceUsd,
              lastPriceUpdatedAt: nextUpdatedAt,
              balance: nextBalance,
              priceSource: CRYPTO_PRICE_SOURCE,
            };
          });

          return changed ? nextAccounts : current;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [accounts]);

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

  const addManualAccount = ({
    name,
    type,
    institution,
    balance,
    quantity,
    cryptoAssetId,
    cryptoName,
    cryptoSymbol,
    cryptoThumb,
    lastPriceUsd,
    lastPriceUpdatedAt,
    priceSource,
  }) => {
    const newAccount = {
      name,
      type,
      institution: institution || "Manual",
      balance: roundCurrency(balance),
      status: "Manual",
    };

    if (type === "Crypto" && cryptoAssetId) {
      Object.assign(newAccount, {
        quantity: Number(quantity) || 0,
        cryptoAssetId,
        cryptoName,
        cryptoSymbol,
        cryptoThumb,
        lastPriceUsd: normalizeCryptoPrice(lastPriceUsd),
        lastPriceUpdatedAt: Number(lastPriceUpdatedAt) || Date.now(),
        priceSource: priceSource || CRYPTO_PRICE_SOURCE,
      });
    }

    setAccounts((current) => [...current, newAccount]);
    openAccountTransactions(name);
  };

  const selectedTransactions = selectedAccount
    ? transactions.filter((tx) => tx.account === selectedAccount)
    : [];

  const visibleTransactions = selectedAccount
    ? selectedTransactions.slice(0, 15)
    : transactions.slice(0, 15);

  const openAccountTransactions = (accountName) => {
    setSelectedAccount(accountName);
    setActiveTab("Transactions");
  };

  const addManualTransaction = (transaction) => {
    const targetAccountName = transaction.account.trim();
    const targetAccount = accounts.find((account) => account.name === targetAccountName);
    const amount = roundCurrency(transaction.amount);

    if (!targetAccount || !Number.isFinite(amount) || amount === 0) return false;
    if (targetAccount.type === "Crypto") return false;

    setTransactions((current) => [
      {
        ...transaction,
        account: targetAccountName,
        amount,
        id: `manual-tx-${Date.now()}-${current.length + 1}`,
        source: "manual",
      },
      ...current,
    ]);
    setAccounts((current) =>
      current.map((account) =>
        account.name === targetAccountName
          ? { ...account, balance: roundCurrency(account.balance + amount) }
          : account
      )
    );
    return true;
  };

  const deleteManualTransaction = (transactionId) => {
    const transactionToDelete = transactions.find(
      (transaction) => transaction.id === transactionId && transaction.source === "manual"
    );

    if (!transactionToDelete) return;

    setTransactions((current) =>
      current.filter(
        (transaction) => transaction.id !== transactionId || transaction.source !== "manual"
      )
    );
    setAccounts((current) =>
      current.map((account) =>
        account.name === transactionToDelete.account
          ? {
              ...account,
              balance: roundCurrency(account.balance - transactionToDelete.amount),
            }
          : account
      )
    );
  };

  const updateTransactionCategory = (transactionIndex, nextCategory) => {
    const transactionToUpdate = visibleTransactions[transactionIndex];

    if (!transactionToUpdate) return;

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

      return current;
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
          ) : activeTab === "Forecast Lab" ? (
            <ForecastLab
              trueCash={trueCash}
              incomeStreams={incomeStreams}
              budgetRows={budgetRows}
              projectionAdjustments={projectionAdjustments}
            />
          ) : activeTab === "Recurring Subscriptions" ? (
            <RecurringSubscriptions
              subscriptions={subscriptions}
              setSubscriptions={setSubscriptions}
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
