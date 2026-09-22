import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../../services/projectServices';
import { getProjectBudgets } from '../../services/budgetServices';
import { createTransactionEntry } from '../../services/transactionServices';

export default function CreateLedgerPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [type, setType] = useState('EXPENSE');
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [category, setCategory] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // Budget Sync State
  const [isBudgetSyncEnabled, setIsBudgetSyncEnabled] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [activeBudgetId, setActiveBudgetId] = useState('');
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects()
      .then(res => setProjects(Array.isArray(res) ? res : (res?.data || [])))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (projectId && isBudgetSyncEnabled) {
      loadBudgetInfo(projectId);
    } else {
      setActiveBudgetId('');
      setBudgetCategories([]);
      setSelectedBudgetCategory('');
    }
  }, [projectId, isBudgetSyncEnabled]);

  const loadBudgetInfo = async (pid) => {
    try {
      const bRes = await getProjectBudgets(pid);
      const bList = Array.isArray(bRes) ? bRes : (bRes?.data || []);
      const active = bList.find(b => b.isActive || b.status === 'ACTIVE');
      if (active) {
        setActiveBudgetId(active.id);
        setBudgetCategories(active.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalAmount = (parseFloat(amount) || 0) + (parseFloat(taxAmount) || 0);

  const handleSubmit = async () => {
    if (!amount || totalAmount <= 0) return alert('Enter valid amount');
    if (!category) return alert('Enter a category');
    if (isBudgetSyncEnabled && !selectedBudgetCategory) return alert('Select a budget category for sync');

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        projectId: projectId || undefined,
        amount: parseFloat(amount),
        taxAmount: parseFloat(taxAmount) || 0,
        totalAmount,
        description,
        category,
        counterpartyName,
        transactionDate: new Date(transactionDate).toISOString(),
        sourceType: 'DIRECT',
        currency: 'INR'
      };

      if (isBudgetSyncEnabled && activeBudgetId) {
        payload.budgetId = activeBudgetId;
        payload.budgetCategoryId = selectedBudgetCategory;
      }

      await createTransactionEntry(payload);
      alert('Transaction logged successfully');
      navigate(-1);
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Create Ledger Entry</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">Transaction Type</label>
          <div className="flex flex-wrap gap-2">
            {['INCOME', 'EXPENSE', 'PETTY_CASH_ISSUE', 'PETTY_CASH_SETTLEMENT', 'PETTY_CASH_REPLENISHMENT'].map(t => (
              <button 
                key={t}
                onClick={() => { setType(t); if (t !== 'EXPENSE') setIsBudgetSyncEnabled(false); }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${type === t ? 'bg-[#0066CC] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Project (Optional)</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC]">
            <option value="">Global / No Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1">Amount *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0066CC]" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1">Tax Amount</label>
            <input type="number" value={taxAmount} onChange={e => setTaxAmount(e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0066CC]" />
          </div>
        </div>

        <div className="bg-blue-50/50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
          <span className="text-sm font-bold text-gray-600">Total Amount</span>
          <span className="text-lg font-bold text-[#0066CC]">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Ledger Category *</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Office Rent, Vendor Payment" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC]" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{type === 'INCOME' ? 'Received From' : 'Paid To'}</label>
          <input type="text" value={counterpartyName} onChange={e => setCounterpartyName(e.target.value)} placeholder="Vendor or Person name" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC]" />
        </div>

        {/* Budget Sync Section */}
        {type === 'EXPENSE' && projectId && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={isBudgetSyncEnabled} onChange={e => setIsBudgetSyncEnabled(e.target.checked)} className="w-4 h-4 text-[#0066CC]" />
              <span className="text-sm font-bold text-gray-800">Deduct from Project Budget</span>
            </label>
            
            {isBudgetSyncEnabled && (
              <div>
                {!activeBudgetId ? (
                  <p className="text-xs font-bold text-red-500">No active budget found for this project.</p>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Budget Category</label>
                    <select value={selectedBudgetCategory} onChange={e => setSelectedBudgetCategory(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC]">
                      <option value="">Select Category</option>
                      {budgetCategories.map(c => (
                        <option key={c.id || c._id} value={c.id || c._id}>
                          {c.category?.replace(/_/g, ' ') || c.category?.name} {c.subCategory ? `- ${c.subCategory}` : ''} (Avail: ₹{Number(c.remainingAmount).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Description / Notes</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" placeholder="Specific details..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC] resize-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Transaction Date</label>
          <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0066CC]" />
        </div>

        <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-4 shadow-md">
          {isSubmitting ? 'Processing...' : 'Log Transaction'}
        </button>
      </div>
    </div>
  );
}
