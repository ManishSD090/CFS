import React, { useState, useEffect } from 'react';
import { getSubcontractors, createContractorProject } from '../../../../services/subcontractor.service';

export default function AssignSubcontractorModal({ isOpen, onClose, projectId, onSuccess }) {
  const [subcontractors, setSubcontractors] = useState([]);
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState('');
  const [workType, setWorkType] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getSubcontractors()
        .then(res => setSubcontractors(res || []))
        .catch(e => console.error(e))
        .finally(() => setIsLoading(false));
      
      // Reset form
      setSelectedSubcontractorId('');
      setWorkType('');
      setContractAmount('');
      setStartDate('');
      setEndDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubcontractorId || !workType || !contractAmount || !startDate || !endDate) {
      alert("Please fill all fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createContractorProject(selectedSubcontractorId, projectId, {
        workType,
        contractAmount: Number(contractAmount),
        startDate,
        endDate
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to assign subcontractor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Subcontractor</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Select Subcontractor</label>
            <select
              value={selectedSubcontractorId}
              onChange={e => setSelectedSubcontractorId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
              required
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading...' : 'Select a Subcontractor...'}</option>
              {subcontractors.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Work Type (e.g. Electrical, Plumbing)</label>
            <input
              type="text"
              value={workType}
              onChange={e => setWorkType(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Contract Amount (₹)</label>
            <input
              type="number"
              value={contractAmount}
              onChange={e => setContractAmount(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-bold text-white bg-[#0066CC] hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Subcontractor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
