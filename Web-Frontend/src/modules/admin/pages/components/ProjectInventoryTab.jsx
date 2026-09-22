// src/modules/admin/pages/components/ProjectInventoryTab.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryService } from '../../../inventory/services/inventory.service';
import MaterialRequestModal from '../../../inventory/components/MaterialRequestModal';
import TransferModal from '../../../inventory/components/TransferModal';
import MaterialFormModal from '../../../inventory/components/MaterialFormModal';
import EquipmentFormModal from '../../../inventory/components/EquipmentFormModal';
import { CardSkeleton } from '../../../../shared/components/Skeletons';

/* ─── tiny helpers ─── */
const fmt = (n) =>
  typeof n === 'number' ? '₹' + n.toLocaleString('en-IN') : '₹0';

const StatusBadge = ({ status }) => {
  const map = {
    REQUESTED: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800',
    APPROVED: 'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800',
    REJECTED: 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800',
    FULFILLED: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-200',
    TRANSFERRED: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-200',
    ORDERED: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200',
    DELIVERED: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
  };
  const cls = map[status] || map.DELIVERED;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cls}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

/* ─── Donut chart ─── */
function DonutChart({ materialValue, equipmentValue }) {
  const total = (materialValue || 0) + (equipmentValue || 0);
  const r = 36, c = 2 * Math.PI * r;
  const eqArc = total > 0 ? (equipmentValue / total) * c : c / 2;
  const matArc = total > 0 ? (materialValue / total) * c : c / 2;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-600" />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#2563eb" strokeWidth="12"
        strokeDasharray={`${eqArc} ${c}`} transform="rotate(-90 45 45)" />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#22c55e" strokeWidth="12"
        strokeDasharray={`${matArc} ${c}`} strokeDashoffset={-eqArc} transform="rotate(-90 45 45)" />
    </svg>
  );
}

/* ─── Material Detail Modal ─── */
function MaterialDetailModal({ material, onClose, onRequest, onTransfer }) {
  if (!material) return null;
  const used = (material.stockQuantity ?? 0);
  const total = material.totalQuantity ?? material.stockQuantity ?? 0;
  const remaining = material.stockQuantity ?? 0;
  const totalCost = (total * (material.unitPrice ?? 0));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700"
        style={{ fontFamily: "'Lexend', sans-serif" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{material.name}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Material Info</h4>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div><span className="text-slate-400">Name: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{material.name}</span></div>
              <div><span className="text-slate-400">Unit: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{material.unit || '—'}</span></div>
              <div><span className="text-slate-400">Total cost: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(totalCost)}</span></div>
              <div><span className="text-slate-400">Cost per unit: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(material.unitPrice)}/{material.unit || 'unit'}</span></div>
              <div><span className="text-slate-400">Used: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{used}</span></div>
              <div><span className="text-slate-400">Total Quantity: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span></div>
              <div><span className="text-slate-400">Remaining: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{remaining}</span></div>
              <div><span className="text-slate-400">Low Stock Threshold: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{material.minimumStock ?? '—'}</span></div>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { onClose(); onRequest(material); }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Request
            </button>
            <button onClick={() => { onClose(); onTransfer({ data: material, type: 'MATERIAL' }); }}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Equipment Detail Modal ─── */
function EquipmentDetailModal({ equipment, onClose, onRequest, onTransfer }) {
  if (!equipment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700"
        style={{ fontFamily: "'Lexend', sans-serif" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{equipment.name}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Equipment Info</h4>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div><span className="text-slate-400">Name: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{equipment.name}</span></div>
              <div><span className="text-slate-400">Type: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{equipment.type || '—'}</span></div>
              <div><span className="text-slate-400">Ownership: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{equipment.ownershipType || 'OWNED'}</span></div>
              <div><span className="text-slate-400">Status: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{equipment.status || 'AVAILABLE'}</span></div>
              <div><span className="text-slate-400">Location: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{equipment.location === 'PROJECT' ? 'On Site' : 'Global Warehouse'}</span></div>
              <div><span className="text-slate-400">{equipment.ownershipType === 'OWNED' ? 'Purchase Cost' : 'Rental Rate'}: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {fmt(equipment.ownershipType === 'OWNED' ? equipment.purchaseCost : equipment.rentalRate)}
                  {equipment.ownershipType !== 'OWNED' ? '/day' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { onClose(); onRequest(equipment); }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Request
            </button>
            <button onClick={() => { onClose(); onTransfer({ data: equipment, type: 'EQUIPMENT' }); }}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── History Modal ─── */
function HistoryModal({ history, onClose }) {
  const [histTab, setHistTab] = useState('materials');
  const [search, setSearch] = useState('');

  const statusStyle = {
    APPROVED: 'bg-green-500 text-white',
    REJECTED: 'bg-red-500 text-white',
    TRANSFERRED: 'bg-brand-600 text-white',
    FULFILLED: 'bg-brand-600 text-white',
    REQUESTED: 'bg-amber-400 text-white',
  };

  const items = (history[histTab] || []).filter(h =>
    !search || h.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col border border-slate-100 dark:border-slate-700"
        style={{ fontFamily: "'Lexend', sans-serif" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-slate-500 hover:text-brand-600 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Inventory History</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search Name" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>
        </div>
        {/* Sub-tabs */}
        <div className="flex gap-1 px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-full p-1">
            {['materials', 'equipments'].map(tab => (
              <button key={tab} onClick={() => setHistTab(tab)}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  histTab === tab ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Date + filter */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <div className="relative">
            <input type="date" className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 outline-none focus:border-brand-400 transition-all" />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No history found.</p>
          ) : items.map((h, i) => (
            <div key={i} className="flex items-start justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{h.name || h.materialName || '—'}</p>
                <p className="text-xs text-slate-400">{h.location || h.projectName || '—'}</p>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{h.type || h.requestType || '—'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[h.status] || 'bg-slate-200 text-slate-700'}`}>
                  {h.status}
                </span>
                <p className="text-xs text-slate-400 mt-1">{h.date || (h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}</p>
                <p className="text-xs text-slate-500 mt-0.5">Quantity: <span className="font-bold text-slate-700 dark:text-slate-200">{h.qty || h.quantity || '—'}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function ProjectInventoryTab({ projectId }) {
  const [view, setView] = useState('materials'); // 'materials' | 'equipments'
  const [materials, setMaterials] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [requestMat, setRequestMat] = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const [addMatOpen, setAddMatOpen] = useState(false);
  const [addEqOpen, setAddEqOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [matRes, eqRes, reqRes] = await Promise.all([
        inventoryService.getAllMaterials(),
        inventoryService.getAllEquipment(),
        inventoryService.getAllMaterialRequests(projectId ? { projectId } : undefined),
      ]);
      if (matRes.success) setMaterials(matRes.data || []);
      if (eqRes.success) setEquipment(eqRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      console.error('ProjectInventoryTab fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]); // reset on toggle
  };

  const handleSelectToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
    setIsDeleting(true);
    try {
      const deletePromises = selectedIds.map(id => 
        view === 'materials' 
          ? inventoryService.deleteMaterial(id) 
          : inventoryService.deleteEquipment(id)
      );
      await Promise.allSettled(deletePromises);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchData(); // Refetch!
    } catch (err) {
      console.error('Failed to delete selected items', err);
      alert('Failed to delete some items.');
    } finally {
      setIsDeleting(false);
    }
  };

  const q = search.toLowerCase();
  const filteredMaterials = materials.filter(m =>
    m.name?.toLowerCase().includes(q) || m.materialCode?.toLowerCase().includes(q)
  );
  const filteredEquipment = equipment.filter(e =>
    e.name?.toLowerCase().includes(q) || e.type?.toLowerCase().includes(q)
  );
  const filteredRequests = requests.filter(r =>
    (!projectId || r.projectId === projectId || r.project?.id === projectId)
  );

  // Stats
  const materialValue = materials.reduce((s, m) => s + (m.stockQuantity || 0) * (m.unitPrice || 0), 0);
  const equipmentValue = equipment.reduce((s, e) => s + (e.purchaseCost || e.rentalRate || 0), 0);
  const totalInventoryValue = materialValue + equipmentValue;

  // Recent activity from requests
  const recentActivity = filteredRequests.slice(0, 3).map(r => ({
    t: r.status === 'APPROVED' ? 'Material Request Approved' :
       r.status === 'REJECTED' ? 'Material Request Rejected' :
       r.status === 'TRANSFERRED' ? 'Material Transferred' : 'Material Requested',
    s: r.materialName || r.requestNo || 'Inventory Item',
    time: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—',
  }));

  if (recentActivity.length === 0) {
    [{ t: 'Materials Received', s: 'Material Cement Batch ID', time: '2h ago' },
     { t: 'Low Stock Alert', s: 'Material Steel Rods', time: '2h ago' },
     { t: 'Material Transferred', s: 'Sand – 24 Dec 2025', time: '5h ago' }].forEach(a => recentActivity.push(a));
  }

  // History data
  const historyData = {
    materials: filteredRequests.map(r => ({
      name: r.materialName || '—',
      location: r.projectName || projectId || '—',
      type: r.requestType || 'Request',
      status: r.status || 'REQUESTED',
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      qty: r.quantity || '—',
    })),
    equipments: equipment.slice(0, 5).map(e => ({
      name: e.name || '—',
      location: e.location === 'PROJECT' ? 'On Site' : 'Global Warehouse',
      type: e.ownershipType === 'RENTED' ? 'Rental' : 'Owned',
      status: e.status || 'AVAILABLE',
      date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      qty: 1,
    })),
  };

  const displayItems = view === 'materials' ? filteredMaterials : filteredEquipment;

  return (
    <div className="space-y-4" style={{ fontFamily: "'Lexend', sans-serif" }}>

      {/* ── Dashboard Row: Donut + Budget ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Card */}
        <div className="bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-5">
          <DonutChart materialValue={materialValue} equipmentValue={equipmentValue} />
          <div className="space-y-1.5 text-xs">
            <p>Equipment: <span className="font-bold text-brand-600">{fmt(equipmentValue)}</span></p>
            <p>Material: <span className="font-bold text-brand-600">{fmt(materialValue)}</span></p>
            <p>Inventory: <span className="font-bold text-slate-700 dark:text-slate-200">{fmt(totalInventoryValue)}</span></p>
            {/* <button
              onClick={() => setView('materials')}
              className="mt-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors">
              View Inventory
            </button> */}
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Budget</h4>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-700"
              style={{ width: totalInventoryValue > 0 ? '60%' : '0%' }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Total Contract</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{materials.length + equipment.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Used</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{fmt(materialValue)}</p>
            </div>
            <div>
              <p className="text-slate-400">Remaining</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{fmt(equipmentValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent activity</h4>
          <button onClick={() => setHistoryOpen(true)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            View all
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.t}</p>
                <p className="text-xs text-slate-400">{a.s}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Materials / Equipments toggle ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {['materials', 'equipments'].map(v => (
            <button key={v} onClick={() => { setView(v); setSearch(''); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === v ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Add button */}
        {view === 'materials' ? (
          <button onClick={() => setAddMatOpen(true)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Material
          </button>
        ) : (
          <button onClick={() => setAddEqOpen(true)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Equipment
          </button>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search Name"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">
            <span className="font-bold text-brand-600">{displayItems.length}</span>{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Total {view === 'materials' ? 'Materials' : 'Equipments'}
            </span>
          </p>
          <p className="text-xs font-bold text-brand-600 mt-0.5">
            {view === 'materials' ? fmt(materialValue) : fmt(equipmentValue)} Total Value
          </p>
        </div>
        <button onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          View History
        </button>
      </div>

      {/* ── List header ── */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {view === 'materials' ? 'Materials List' : 'Equipments List'}
        </h4>
        <div className="flex items-center gap-2">
          {/* Always show Select mode toggler */}
          <button 
            onClick={toggleSelectMode}
            className={`flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${
              isSelectMode 
                ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
            {isSelectMode ? 'Cancel Selection' : 'Select'}
          </button>
          
          <button className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>

          {isSelectMode && selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-white transition-colors text-xs font-medium disabled:opacity-50">
              {isDeleting ? 'Deleting...' : `Delete (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ── Card grid ── */}
      {isLoading ? (
        <CardSkeleton count={4} gridClass="grid grid-cols-1 sm:grid-cols-2 gap-3" />
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>
          </svg>
          <p className="text-sm text-slate-400 font-medium">No {view} found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {view === 'materials'
            ? filteredMaterials.map(mat => (
              <div key={mat.id}
                onClick={(e) => {
                  if (isSelectMode) {
                    handleSelectToggle(mat.id);
                  } else {
                    setSelectedMaterial(mat);
                  }
                }}
                className={`bg-white dark:bg-slate-700/40 border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all group relative ${
                  selectedIds.includes(mat.id) ? 'border-brand-400 dark:border-brand-500 bg-brand-50/10' : 'border-slate-100 dark:border-slate-700'
                }`}>
                
                {isSelectMode && (
                  <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(mat.id)}
                      onChange={() => handleSelectToggle(mat.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer pointer-events-none"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-2 mb-2 pr-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{mat.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{mat.materialCode || '—'}</p>
                  </div>
                  {mat.stockQuantity <= (mat.minimumStock || 0) && mat.minimumStock != null && (
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total: <span className="font-bold text-brand-600">{mat.stockQuantity ?? 0} {mat.unit || ''}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Remaining: <span className="font-bold text-brand-600">{mat.stockQuantity ?? 0} {mat.unit || ''}</span>
                </p>
                {mat.category && (
                  <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 uppercase tracking-wider">
                    {mat.category}
                  </span>
                )}
              </div>
            ))
            : filteredEquipment.map(eq => (
              <div key={eq.id}
                onClick={() => {
                  if (isSelectMode) {
                    handleSelectToggle(eq.id);
                  } else {
                    setSelectedEquipment(eq);
                  }
                }}
                className={`bg-white dark:bg-slate-700/40 border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all group relative ${
                  selectedIds.includes(eq.id) ? 'border-brand-400 dark:border-brand-500 bg-brand-50/10' : 'border-slate-100 dark:border-slate-700'
                }`}>
                
                {isSelectMode && (
                  <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(eq.id)}
                      onChange={() => handleSelectToggle(eq.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer pointer-events-none"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-2 mb-2 pr-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{eq.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{eq.type || '—'}</p>
                  </div>
                  {eq.status === 'IN_USE' && (
                    <span className="text-xs font-bold bg-brand-600 text-white px-2.5 py-0.5 rounded-lg flex-shrink-0">In use</span>
                  )}
                </div>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {eq.ownershipType === 'OWNED' ? 'Owned' : 'Rented'}
                  {eq.ownershipType !== 'OWNED' && eq.rentalRate ? ` · ${fmt(eq.rentalRate)}/day` : ''}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    eq.status === 'AVAILABLE' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                  }`}>{eq.status || 'AVAILABLE'}</span>
                  <span className="text-xs text-slate-400">{eq.location === 'PROJECT' ? 'On Site' : 'Warehouse'}</span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── Requests quick-summary strip ── */}
      {filteredRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Material Requests
              <span className="ml-2 bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {filteredRequests.length}
              </span>
            </h4>
          </div>
          <div className="space-y-2">
            {filteredRequests.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{req.materialName || '—'}</p>
                  <p className="text-xs text-slate-400">{req.purpose || '—'} · <span className={`font-bold ${req.urgency === 'HIGH' || req.urgency === 'CRITICAL' ? 'text-red-500' : 'text-slate-500'}`}>{req.urgency}</span></p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {req.quantity} <span className="text-xs font-normal text-slate-400">{req.unit || 'nos'}</span>
                  </span>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedMaterial && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onRequest={mat => setRequestMat(mat)}
          onTransfer={item => setTransferItem(item)}
        />
      )}

      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onRequest={eq => setRequestMat(eq)}
          onTransfer={item => setTransferItem(item)}
        />
      )}

      {historyOpen && (
        <HistoryModal history={historyData} onClose={() => setHistoryOpen(false)} />
      )}

      <MaterialRequestModal
        isOpen={!!requestMat}
        onClose={() => setRequestMat(null)}
        material={requestMat}
        projectId={projectId}
        onSuccess={fetchData}
      />

      <TransferModal
        isOpen={!!transferItem}
        onClose={() => setTransferItem(null)}
        itemData={transferItem?.data}
        type={transferItem?.type || 'MATERIAL'}
        onSuccess={fetchData}
      />

      <MaterialFormModal
        isOpen={addMatOpen}
        onClose={() => setAddMatOpen(false)}
        onSuccess={fetchData}
      />

      <EquipmentFormModal
        isOpen={addEqOpen}
        onClose={() => setAddEqOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
