export const mapTransactions = (list = []) =>
  list.map((t) => ({
    id: t.id,
    date: t.transactionDate,
    amount: t.totalAmount,
    type:
      t.type === "INCOME"
        ? "CREDIT"
        : t.type === "EXPENSE"
        ? "DEBIT"
        : t.type,
    status: t.status,
    category: t.category,
    description: t.description,
    createdBy: t.requestedBy?.name,
  }));

export const mapSummary = (summary) => ({
  totalExpenses: summary?.totalExpense || 0,
  totalCredits: summary?.totalIncome || 0,
  balance: summary?.pettyCashNet || 0,
});