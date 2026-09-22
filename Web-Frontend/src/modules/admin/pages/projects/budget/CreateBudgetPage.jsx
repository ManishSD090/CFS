import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBudgetById, createBudget } from '../../../services/budgetServices';

const CATEGORIES = [
  'CIVIL_WORKS', 'ARCHITECTURAL', 'STRUCTURAL', 'MEP', 'FINISHES', 'EXTERNAL_WORKS', 
  'EQUIPMENT', 'LABOR', 'MATERIALS', 'CONSULTANCY', 'PERMITS', 'CONTINGENCY', 'OTHER'
];

export default function CreateBudgetPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const copyFromId = searchParams.get('copyFrom');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rows, setRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!copyFromId);

  useEffect(() => {
    if (!copyFromId) {
      setRows([{ id: Date.now(), category: '', subCategory: '', amount: '' }]);
      return;
    }

    getBudgetById(copyFromId).then(budget => {
      setName(`${budget.name} (New Version)`);
      setDescription(budget.description || '');
      
      if (budget.categories?.length > 0) {
        setRows(budget.categories.map(cat => ({
          id: Date.now() + Math.random(),
          category: cat.category,
          subCategory: cat.subCategory || '',
          amount: cat.allocatedAmount.toString()
        })));
      } else {
        setRows([{ id: Date.now(), category: '', subCategory: '', amount: '' }]);
      }
    }).catch(e => {
      console.error(e);
      setRows([{ id: Date.now(), category: '', subCategory: '', amount: '' }]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [copyFromId]);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now() + Math.random(), category: '', subCategory: '', amount: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleChangeRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const totalAmount = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Name is required');
    if (!startDate) return alert('Start date is required');
    
    const validRows = rows.filter(r => r.category && r.amount);
    if (validRows.length === 0) return alert('At least one valid category item is required');

    setIsSubmitting(true);
    try {
      const payload = {
        projectId,
        name: name.trim(),
        description: description.trim(),
        budgetPeriod: 'PROJECT_PHASE',
        contingencyPercent: 5.0,
        startDate: new Date(startDate).toISOString(),
        ...(endDate && { endDate: new Date(endDate).toISOString() }),
        categories: validRows.map(r => ({
          category: r.category,
          subCategory: r.subCategory.trim(),
          allocatedAmount: parseFloat(r.amount)
        }))
      };
      
      await createBudget(payload);
      navigate(-1);
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Create Budget Version</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : (
          <>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Budget Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
                  <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex bg-gray-50 px-4 py-3 border-b border-gray-100 text-xs font-bold text-gray-600">
                <div className="w-8">Sr.</div>
                <div className="flex-1">Category / Sub</div>
                <div className="w-24 text-right">Amount</div>
                <div className="w-10"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <div key={row.id} className="flex items-start px-4 py-3 gap-3">
                    <div className="w-8 pt-2 text-xs text-gray-500 font-medium">{(i + 1).toString().padStart(2, '0')}</div>
                    <div className="flex-1 space-y-2">
                      <select value={row.category} onChange={e => handleChangeRow(i, 'category', e.target.value)} className="w-full border border-gray-200 rounded text-sm px-2 py-1.5 outline-none focus:border-[#0066CC]">
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="text" placeholder="Sub-category (Optional)" value={row.subCategory} onChange={e => handleChangeRow(i, 'subCategory', e.target.value)} className="w-full border border-gray-200 rounded text-sm px-2 py-1.5 outline-none focus:border-[#0066CC]" />
                    </div>
                    <div className="w-24">
                      <input type="number" placeholder="0" value={row.amount} onChange={e => handleChangeRow(i, 'amount', e.target.value)} className="w-full border border-gray-200 rounded text-sm px-2 py-1.5 outline-none focus:border-[#0066CC] text-right font-semibold" />
                    </div>
                    <div className="w-10 pt-1 text-right">
                      <button onClick={() => handleRemoveRow(i)} disabled={rows.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button onClick={handleAddRow} className="text-sm font-bold text-[#0066CC] flex items-center gap-1 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> Add Row
                </button>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total ({rows.length})</div>
                  <div className="text-lg font-bold text-[#0066CC]">₹{totalAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            <button disabled={isSubmitting} onClick={handleSubmit} className="w-full mt-6 py-3.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
