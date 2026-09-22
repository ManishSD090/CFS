import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgetCategories, createCommitment, createExpenseTransaction, transferBetweenCategories } from '../../../services/budgetServices';

export default function AddBudgetRecordPage({ budgetId, initialType = 'EXPENSE', onCancel, onSuccess }) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fromCategoryId, setFromCategoryId] = useState('');
  const [toCategoryId, setToCategoryId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!budgetId) return;
    setIsLoading(true);
    getBudgetCategories(budgetId)
      .then(res => {
        setCategories(Array.isArray(res) ? res : (res?.data || []));
      })
      .catch(e => {
        console.error("Failed to load categories", e);
        alert('Failed to load categories');
      })
      .finally(() => setIsLoading(false));
  }, [budgetId]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return alert('Please enter a valid amount');
    }

    if (selectedType === 'TRANSFER') {
      if (!fromCategoryId || !toCategoryId) return alert('Select both From and To categories');
      if (fromCategoryId === toCategoryId) return alert('Cannot transfer to the same category');
      
      const fromCat = categories.find(c => c.id === fromCategoryId);
      if (fromCat && parsedAmount > fromCat.remainingAmount) {
        return alert('Transfer amount exceeds available funds');
      }
    } else {
      if (!selectedCategoryId) return alert('Select a budget category');
      
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat && parsedAmount > cat.remainingAmount) {
        return alert('Amount exceeds available category funds');
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parsedAmount,
        description: notes.trim() || (selectedType === 'TRANSFER' ? 'Transfer funds' : `General ${selectedType.toLowerCase()}`)
      };

      if (selectedType === 'TRANSFER') {
        await transferBetweenCategories(budgetId, {
          fromCategoryId,
          toCategoryId,
          ...payload
        });
      } else if (selectedType === 'EXPENSE') {
        await createExpenseTransaction(budgetId, {
          categoryId: selectedCategoryId,
          ...payload
        });
      } else if (selectedType === 'COMMITMENT') {
        await createCommitment(budgetId, {
          categoryId: selectedCategoryId,
          ...payload
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryOptions = () => (
    <>
      <option value="">Select Category</option>
      {categories.map(c => (
        <option key={c.id} value={c.id}>
          {c.category.replace(/_/g, ' ')} {c.subCategory ? `- ${c.subCategory}` : ''} 
          (Avail: ₹{Number(c.remainingAmount).toLocaleString('en-IN')})
        </option>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4">
        <button onClick={onCancel} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Add Budget Record</h1>
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 mb-2">Record Type</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['EXPENSE', 'COMMITMENT', 'TRANSFER'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedCategoryId('');
                      setFromCategoryId('');
                      setToCategoryId('');
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedType === type ? 'bg-[#0066CC] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {selectedType === 'TRANSFER' ? (
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">From Category *</label>
                  <select value={fromCategoryId} onChange={e => setFromCategoryId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]">
                    {renderCategoryOptions()}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">To Category *</label>
                  <select value={toCategoryId} onChange={e => setToCategoryId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]">
                    {renderCategoryOptions()}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 mb-1">Budget Category *</label>
                <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]">
                  {renderCategoryOptions()}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-1">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[#0066CC] font-bold" />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-1">Transaction Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-500 mb-1">Description / Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" placeholder="Enter description (Optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC] resize-none" />
            </div>

            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
