import { useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
  approveTransaction,
  rejectTransaction,
  getTransactionSummary,
} from "../services/transaction.service";

import {
  mapTransactions,
  mapSummary,
} from "../adapters/transaction.adapter";

const useTransactions = (projectId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const [txRes, summaryRes] = await Promise.all([
        getTransactions({ projectId }),
        getTransactionSummary(projectId),
      ]);

      setTransactions(mapTransactions(txRes));
      setSummary(mapSummary(summaryRes));
    } catch (err) {
      console.error("Transactions error:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload) => {
    await createTransaction({ ...payload, projectId });
    await fetchTransactions();


  };

  const approve = async (id, payload) => {
    await approveTransaction(id, payload);
    await fetchTransactions();
  };

  const reject = async (id, payload) => {
    await rejectTransaction(id, payload);
    await fetchTransactions();
  };

  useEffect(() => {
    if (projectId) {
      fetchTransactions();
    }
  }, [projectId]);

  return {
    transactions,
    summary,
    loading,
    error,
    refetch: fetchTransactions,
    create,
    approve,
    reject,
  };
};
 
export default useTransactions;