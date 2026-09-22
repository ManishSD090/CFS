import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBudgetById, approveRejectBudget, approveRejectRevision } from '../../services/budgetServices';

export default function BudgetApprovalDetailsPage() {
  const { approvalId } = useParams();
  const navigate = useNavigate();

  const [approvalItem, setApprovalItem] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBudgetById(approvalId)
      .then(res => setApprovalItem({ budget: res }))
      .catch(e => {
        alert('Failed to load approval details');
        navigate(-1);
      })
      .finally(() => setIsLoading(false));
  }, [approvalId, navigate]);

  const processApproval = async (isApproved) => {
    if (!isApproved && !remarks.trim()) {
      return alert('Please enter a reason for rejection.');
    }

    setIsProcessing(true);
    try {
      const budget = approvalItem.budget;
      const revision = approvalItem.revision;

      if (revision) {
        await approveRejectRevision(revision.id, {
          isApproved,
          reason: remarks.trim() || undefined
        });
      } else {
        await approveRejectBudget(budget.id, {
          isApproved,
          reason: remarks.trim() || undefined
        });
      }

      alert(isApproved ? 'Approved' : 'Rejected');
      navigate(-1);
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  }

  if (!approvalItem) return null;

  const budget = approvalItem.budget;
  const revision = approvalItem.revision;
  const isRevision = !!revision;
  
  const displayTitle = isRevision ? `REV: ${budget.name}` : budget.name;
  const labelText = isRevision ? "Budget Revision" : "Base Budget";

  const particularsList = [];
  if (isRevision) {
    const changes = revision.categoryChanges || {};
    let index = 1;
    Object.keys(changes).forEach(categoryId => {
      const changeData = changes[categoryId];
      let amount = 0;
      if (typeof changeData === 'number') amount = changeData;
      else if (changeData && changeData.change !== undefined) amount = changeData.change;

      particularsList.push({
        sr: (index++).toString().padStart(2, '0'),
        name: "Category Update",
        amountText: `${amount >= 0 ? '+' : ''}₹${Number(amount).toLocaleString('en-IN')}`,
        isHighlight: true,
        amount
      });
    });
  } else {
    const categories = budget.categories || [];
    categories.forEach((cat, i) => {
      particularsList.push({
        sr: (i + 1).toString().padStart(2, '0'),
        name: cat.category.replace(/_/g, ' '),
        amountText: `₹${Number(cat.allocatedAmount).toLocaleString('en-IN')}`,
        isHighlight: false,
        amount: cat.allocatedAmount
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Budget Approvals</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">{displayTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{budget.project?.name || 'Unknown Project'}</p>
            <p className="text-xs font-semibold text-[#0066CC] mt-1">{labelText}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-800">Manager: {budget.createdBy?.name || 'System'}</p>
            {isRevision && revision.reason && (
              <div className="mt-3 p-3 bg-orange-50 text-orange-800 text-sm italic rounded-lg">
                Reason: {revision.reason}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex text-sm font-bold text-gray-600 border-b border-gray-200 pb-2 mb-3">
              <div className="w-10">Sr.</div>
              <div className="flex-1">Category</div>
              <div className="text-right">Amount</div>
            </div>
            
            {particularsList.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No category details found.</div>
            ) : (
              <div className="space-y-4">
                {particularsList.map((item, i) => (
                  <div key={i} className="flex text-sm text-gray-800">
                    <div className="w-10 text-gray-500">{item.sr}</div>
                    <div className="flex-1">{item.name}</div>
                    <div className={`text-right ${item.isHighlight ? (item.amount >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold') : ''}`}>
                      {item.amountText}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-gray-200 mt-4 pt-4">
              <span className="font-bold text-sm">Total Allocation:</span>
              <span className="text-lg font-bold text-[#0066CC]">
                ₹{Number(isRevision ? revision.newTotal : budget.totalApproved).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
            <input 
              type="text" 
              placeholder="Approval/Reject Remarks" 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              className="w-full border border-[#0066CC] rounded-lg px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#0066CC]" 
            />

            <div className="flex gap-4 mt-6">
              <button disabled={isProcessing} onClick={() => processApproval(true)} className="flex-1 py-3 bg-[#4CAF50] text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                Approve
              </button>
              <button disabled={isProcessing} onClick={() => processApproval(false)} className="flex-1 py-3 bg-[#EF5350] text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
