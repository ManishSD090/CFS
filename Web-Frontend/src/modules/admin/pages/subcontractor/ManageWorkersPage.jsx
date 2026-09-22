import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../../../shared/components/PageContainer';
import { getSubcontractorWorkers, addSubcontractorWorker, getSubcontractorById } from '../../services/subcontractor.service';
import { ListSkeleton } from '../../../../shared/components/Skeletons';

const SKILL_LEVELS = ['UNSKILLED', 'SEMI_SKILLED', 'SKILLED', 'HIGHLY_SKILLED'];

export default function ManageWorkersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [subcontractor, setSubcontractor] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Worker Form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    skillLevel: 'SEMI_SKILLED',
    trade: '',
    dailyWage: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scRes, workersRes] = await Promise.all([
        getSubcontractorById(id),
        getSubcontractorWorkers(id)
      ]);
      setSubcontractor(scRes);
      setWorkers(workersRes || []);
    } catch (e) {
      alert('Failed to load workers: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        dailyWage: form.dailyWage ? parseFloat(form.dailyWage) : undefined
      };
      await addSubcontractorWorker(id, payload);
      setForm({ name: '', phone: '', skillLevel: 'SEMI_SKILLED', trade: '', dailyWage: '' });
      setIsAddOpen(false);
      fetchData(); // Refresh list
    } catch (e) {
      alert('Failed to add worker: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-[85vh] font-sans pb-28">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-4 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 className="text-gray-900 dark:text-white text-lg font-bold">Manage Workers</h1>
              {subcontractor && <p className="text-xs text-gray-500 font-medium">{subcontractor.name}</p>}
            </div>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#0f62fe] hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Worker
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          
          {/* Workers List */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Registered Workers</h3>
              <span className="text-xs font-bold bg-blue-50 text-[#0f62fe] px-2 py-1 rounded-full">{workers.length} Total</span>
            </div>
            
            {isLoading ? (
              <div className="p-5"><ListSkeleton rows={4} /></div>
            ) : workers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Worker Name</th>
                      <th className="px-5 py-3">Trade & Skill</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Daily Wage (₹)</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {workers.map(worker => (
                      <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{worker.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{worker.workerId || worker.id.substring(0,8)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-700 dark:text-gray-300">{worker.trade || 'General'}</div>
                          <div className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                            {worker.skillLevel?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-600 dark:text-gray-400">
                          {worker.phone || '-'}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          {worker.dailyWage ? `₹${worker.dailyWage}` : '-'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                            worker.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {worker.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <p className="text-sm font-medium text-gray-500">No workers found for this subcontractor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Worker Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Add New Worker</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddWorker} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Worker Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Phone *</label>
                  <input type="text" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Daily Wage (₹)</label>
                  <input type="number" step="0.01" value={form.dailyWage} onChange={e => setForm({...form, dailyWage: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Skill Level *</label>
                <select value={form.skillLevel} onChange={e => setForm({...form, skillLevel: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]">
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Trade (e.g., Mason, Carpenter)</label>
                <input type="text" value={form.trade} onChange={e => setForm({...form, trade: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#0f62fe] text-white font-bold rounded-xl text-sm disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Worker'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
