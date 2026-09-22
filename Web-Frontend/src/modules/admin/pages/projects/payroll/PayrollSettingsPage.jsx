import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShiftTypes, createShiftType, deleteShiftType, getLabourRates, createLabourRate, bulkDeleteLabourRates, bulkDeleteShiftTypes } from '../../../services/payrollServices';

export default function PayrollSettingsPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [labourRates, setLabourRates] = useState([]);
  const [selectedRateIds, setSelectedRateIds] = useState(new Set());
  const [selectedShiftIds, setSelectedShiftIds] = useState(new Set());

  // New item modals state
  const [showRateModal, setShowRateModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [newRateValue, setNewRateValue] = useState('');
  const [newShiftMultiplier, setNewShiftMultiplier] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [shiftsData, ratesData] = await Promise.all([
        getShiftTypes(),
        getLabourRates({ isCurrent: true }),
      ]);
      // Global presets: no siteStaffId and no subcontractorWorkerId
      const globalPresets = (Array.isArray(ratesData) ? ratesData : [])
        .filter(r => !r.siteStaffId && !r.subcontractorWorkerId);
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      setLabourRates(globalPresets);
      setSelectedRateIds(new Set());
      setSelectedShiftIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Failed to load settings: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRate = (id) => {
    setSelectedRateIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleShift = (id) => {
    setSelectedShiftIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleAddRate = async () => {
    const rate = parseFloat(newRateValue);
    if (!rate || rate <= 0) return alert('Enter a valid rate');
    setIsSaving(true);
    try {
      // Global preset: workerType SITE_STAFF, no workerId (backend accepts empty string as global)
      await createLabourRate({ workerType: 'SITE_STAFF', rate, effectiveFrom: new Date().toISOString() });
      setNewRateValue('');
      setShowRateModal(false);
      loadSettings();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddShift = async () => {
    const mult = parseFloat(newShiftMultiplier);
    if (!mult || mult <= 0) return alert('Enter a valid multiplier');
    setIsSaving(true);
    try {
      await createShiftType({ name: `x${newShiftMultiplier}`, multiplier: mult });
      setNewShiftMultiplier('');
      setShowShiftModal(false);
      loadSettings();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRates = async () => {
    if (selectedRateIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedRateIds.size} labour rate(s)?`)) return;
    setIsSaving(true);
    try {
      await bulkDeleteLabourRates([...selectedRateIds]);
      loadSettings();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShifts = async () => {
    if (selectedShiftIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedShiftIds.size} shift type(s)?`)) return;
    setIsSaving(true);
    try {
      await bulkDeleteShiftTypes([...selectedShiftIds]);
      loadSettings();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      {/* Header */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Payroll Settings</h1>
      </div>

      <div className="p-4 space-y-6">

        {/* ─── Labour Rates ─────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">Project Specific Labour Rate</h2>
              <p className="text-xs text-gray-400 mt-0.5">Global rate presets (₹/day). Workers with no individual rate use these.</p>
            </div>
            {selectedRateIds.size > 0 && (
              <button onClick={handleDeleteRates} disabled={isSaving} className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete ({selectedRateIds.size})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {labourRates.map(r => {
              const isSelected = selectedRateIds.has(r.id);
              return (
                <button key={r.id} onClick={() => toggleRate(r.id)} className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${isSelected ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>
                  ₹{r.rate}
                </button>
              );
            })}
            <button onClick={() => setShowRateModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200 text-xl font-bold transition-colors">+</button>
          </div>
          {labourRates.length === 0 && !isLoading && (
            <p className="text-sm text-gray-400 mt-2">No rate presets. Tap + to add one.</p>
          )}
        </div>

        {/* ─── Shift Types ─────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">Global Available Shifts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Multipliers applied to base rate per attendance record.</p>
            </div>
            {selectedShiftIds.size > 0 && (
              <button onClick={handleDeleteShifts} disabled={isSaving} className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete ({selectedShiftIds.size})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {shifts.map(s => {
              const isSelected = selectedShiftIds.has(s.id);
              return (
                <button key={s.id} onClick={() => toggleShift(s.id)} className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${isSelected ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-white border-blue-200 text-[#0066CC] hover:bg-blue-50'}`}>
                  x{s.multiplier}
                </button>
              );
            })}
            <button onClick={() => setShowShiftModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-[#0066CC] hover:bg-blue-100 border-2 border-blue-200 text-xl font-bold transition-colors">+</button>
          </div>
          {shifts.length === 0 && !isLoading && (
            <p className="text-sm text-gray-400 mt-2">No shift types. Tap + to add one.</p>
          )}
        </div>

        {/* Info box about data dependency */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-xs font-bold text-blue-700 mb-1">How Payroll is Calculated</h4>
          <p className="text-xs text-blue-600/80 leading-relaxed">
            Payroll reads <strong>attendance records</strong> marked via the Attendance module (Mark Attendance page). Each PRESENT record contributes: <code className="bg-blue-100 px-1 rounded">Base Rate × Shift Multiplier = Day Amount</code>. Running payroll does NOT create a Ledger entry — it deducts from the project Budget's <strong>LABOR category</strong> automatically when status is set to PAID.
          </p>
        </div>

        {/* Save = Done button */}
        <button onClick={() => navigate(-1)} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md">
          Done
        </button>
      </div>

      {/* Add Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-4">Add Labour Rate</h3>
            <input type="number" value={newRateValue} onChange={e => setNewRateValue(e.target.value)} placeholder="e.g. 600" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0066CC] mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowRateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddRate} disabled={isSaving} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-4">Add Shift Multiplier</h3>
            <input type="number" step="0.5" value={newShiftMultiplier} onChange={e => setNewShiftMultiplier(e.target.value)} placeholder="e.g. 1.5" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0066CC] mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowShiftModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddShift} disabled={isSaving} className="flex-1 py-2.5 bg-[#0066CC] text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
