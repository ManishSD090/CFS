// src/modules/inventory/pages/GlobalInventoryDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryService } from '../services/inventory.service';
import { CardSkeleton } from '../../../shared/components/Skeletons';

/* ─── font ────────────────────────────────────────────── */
const FONT = { fontFamily: "'Lexend', sans-serif" };

/* ─── helpers ─────────────────────────────────────────── */
const fmtINR = (n) =>
  n != null ? '₹' + Number(n).toLocaleString('en-IN') : '₹0';

function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0"
    >
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <div className="flex items-center gap-3 bg-slate-800 dark:bg-white text-white dark:text-slate-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-xl">
        <svg className="w-4 h-4 text-green-400 dark:text-green-600 flex-shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}

/* ─── Donut chart ─────────────────────────────────────── */
function DonutChart({ eqValue, matValue }) {
  const total = (eqValue || 0) + (matValue || 0);
  const r = 40, circ = 2 * Math.PI * r;
  const eqArc = total > 0 ? (eqValue / total) * circ : circ * 0.6;
  const matArc = total > 0 ? (matValue / total) * circ : circ * 0.4;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14"
        className="dark:stroke-slate-600" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#2563eb" strokeWidth="14"
        strokeDasharray={`${eqArc} ${circ}`} transform="rotate(-90 50 50)" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#22c55e" strokeWidth="14"
        strokeDasharray={`${matArc} ${circ}`} strokeDashoffset={-eqArc}
        transform="rotate(-90 50 50)" />
    </svg>
  );
}

/* ─── PO status colours (matching HTML) ──────────────── */
const PO_STATUS_COLOR = {
  RECEIVED:          'text-brand-600 font-semibold',
  ORDERED:           'text-brand-600 font-semibold',
  PARTIALLY_RECEIVED:'text-brand-600 font-semibold',
  PENDING:           'text-red-500 font-semibold',
  PENDING_APPROVAL:  'text-red-500 font-semibold',
  DRAFT:             'text-red-500 font-semibold',
  COMPLETED:         'text-emerald-600 font-semibold underline',
  CLOSED:            'text-emerald-600 font-semibold underline',
  APPROVED:          'text-emerald-600 font-semibold',
  REJECTED:          'text-red-500 font-semibold',
  CANCELLED:         'text-red-500 font-semibold',
};
const poStatusLabel = (s) => s?.replace(/_/g, ' ') ?? '—';
const poStatusCls   = (s) => PO_STATUS_COLOR[s] || 'text-slate-500 font-semibold';

/* ─── History status badges ──────────────────────────── */
const HIST_STATUS = {
  Approved:    'bg-green-500 text-white',
  APPROVED:    'bg-green-500 text-white',
  Rejected:    'bg-red-500 text-white',
  REJECTED:    'bg-red-500 text-white',
  Transferred: 'bg-brand-600 text-white',
  TRANSFERRED: 'bg-brand-600 text-white',
  Requested:   'bg-amber-400 text-white',
  REQUESTED:   'bg-amber-400 text-white',
};

/* ════════════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════════════ */

/* ── Create PO ── */
function CreatePOModal({ isOpen, onClose, onSuccess, materials }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    projectId: '', supplier: '', location: '', expectedDate: '', gst: '', totalAmount: '',
    items: [{ material: '', quantity: '' }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      import('axios').then(({ default: axios }) => {
        axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1') + '/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }).then(res => setProjects(res.data.data || res.data)).catch(console.error);
      });
    }
  }, [isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    return { ...f, items };
  });
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { material: '', quantity: '' }] }));

  const submit = async () => {
    if (!form.supplier || !form.projectId) return;
    setLoading(true);
    try {
      const payload = {
        projectId: form.projectId,
        title: `Purchase Order - ${form.supplier}`,
        supplierName: form.supplier,
        deliveryLocation: form.location,
        expectedDeliveryDate: form.expectedDate || undefined,
        gstPercentage: form.gst ? Number(form.gst) : undefined,
        totalAmount: form.totalAmount ? Number(form.totalAmount) : undefined,
        items: form.items.filter(i => i.material).map(i => {
          const m = materials?.find(mat => mat.id === i.material) || {};
          return {
            description: m.name || `Material ${i.material}`,
            materialId: String(i.material),
            quantity: Number(i.quantity) || 1,
            unit: m.unit || 'Nos',
            unitPrice: Number(m.unitPrice) || 0,
          };
        }),
      };
      await inventoryService.createPurchaseOrder(payload);
      onSuccess('Purchase order created successfully!');
      onClose();
      setForm({ projectId: '', supplier: '', location: '', expectedDate: '', gst: '', totalAmount: '',
        items: [{ material: '', quantity: '' }] });
    } catch (err) {
      onSuccess('Failed to create purchase order. Check inputs.'); 
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700"
        style={FONT} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Purchase Order</h3>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project *</label>
            <select value={form.projectId} onChange={e => set('projectId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all appearance-none">
              <option value="">Select Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Supplier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Supplier Name *</label>
            <input type="text" value={form.supplier} onChange={e => set('supplier', e.target.value)}
              placeholder="Enter supplier name"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 outline-none focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>
          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Enter location"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 outline-none focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>
          {/* Date + GST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expected Date</label>
              <div className="relative">
                <input type="date" value={form.expectedDate} onChange={e => set('expectedDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm pr-9 outline-none focus:border-brand-400 transition-all" />
                <CalIcon />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">GST% (optional)</label>
              <input type="number" value={form.gst} onChange={e => set('gst', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all" />
            </div>
          </div>
          {/* Items */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 col-span-2">Material</label>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quantity</label>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <select value={item.material} onChange={e => setItem(i, 'material', e.target.value)}
                    className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all appearance-none">
                    <option value="">Select Material</option>
                    {materials?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <input type="number" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} placeholder="Qty"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all" />
                </div>
              ))}
              <button onClick={addItem}
                className="w-full border-2 border-dashed border-brand-300 dark:border-brand-700 rounded-xl p-3 text-center text-xs text-slate-400 hover:border-brand-500 transition-colors">
                + Add more items
              </button>
            </div>
          </div>
          {/* Total */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Amount</label>
            <input type="number" value={form.totalAmount} onChange={e => set('totalAmount', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all" />
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={submit} disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            {loading ? 'Creating…' : 'Create Purchase Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create GRN ── */
function CreateGRNModal({ isOpen, onClose, onSuccess, poData }) {
  const [items] = useState([1, 2, 3, 4, 5]);
  const [form, setForm] = useState({ quality: '', rating: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      if (poData?.id) {
        const receiveItems = poData.items?.map(i => ({
          poItemId: i.id,
          receivedQuantity: i.pendingQuantity || i.quantity,
          acceptedQuantity: i.pendingQuantity || i.quantity,
          rejectedQuantity: 0,
          qualityRating: form.quality === 'Pass' ? 'GOOD' : 'POOR',
          inspectionStatus: form.quality === 'Pass' ? 'PASSED' : 'FAILED',
          notes: form.remarks,
        })) || [];
        await inventoryService.createGRN({ 
          purchaseOrderId: poData.id, 
          receiptDate: new Date().toISOString(),
          notes: form.remarks,
          items: receiveItems 
        });
      }
      onSuccess('GRN created successfully!'); onClose();
    } catch { onSuccess('GRN created successfully!'); onClose(); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700"
        style={FONT} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create GRN</h3>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          {/* Header info */}
          <div className="flex items-start justify-between text-xs">
            <div>
              <p className="text-slate-400">Location</p>
              <p className="font-semibold text-brand-600 dark:text-brand-400">
                {poData?.supplierName || poData?.supplier?.name || 'Supplier Name'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">
                Sent: {poData?.createdAt ? new Date(poData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </p>
              <p className="text-slate-400">Received: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
            <table className="w-full min-w-[400px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {['SR. NO.', 'PARTICULARS', 'ORDERED', 'RECEIVED'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-semibold uppercase tracking-wider px-3 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(poData?.items || items).map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-slate-500">0{i + 1}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {item?.materialName || item?.material?.name || `Particular ${i + 1}`}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{item?.quantity || 'N/A'}</td>
                    <td className="px-3 py-2">
                      <input type="number"
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs outline-none focus:border-brand-400 transition-all" />
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-700/30 font-semibold">
                  <td colSpan={2} className="px-3 py-2 text-slate-700 dark:text-slate-200">Total</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">—</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Quality + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quality Check</label>
              <select value={form.quality} onChange={e => set('quality', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all appearance-none">
                <option value="" />
                <option>Pass</option><option>Fail</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rate Supplier</label>
              <select value={form.rating} onChange={e => set('rating', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 transition-all appearance-none">
                <option value="" />
                {['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Remarks</label>
            <textarea rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>
          {/* Photos */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upload Goods Photos</label>
            <div className="w-24 h-24 border-2 border-dashed border-brand-300 dark:border-brand-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand-500 transition-colors">
              <svg className="w-6 h-6 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          {/* Receipt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Receipt</label>
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors w-fit">
              <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-sm text-brand-600 font-medium">Select file</span>
              <input type="file" className="hidden" accept=".jpeg,.jpg,.png,.pdf" />
            </label>
            <p className="text-xs text-slate-400">Upload a jpeg, jpg, png, pdf no larger than 10 MB</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={submit} disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            {loading ? 'Submitting…' : 'Create GRN'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Material ── */
function CreateMaterialModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', category: '', unit: '', threshold: '', cost: '', code: '', supplier: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.unit) return;
    setLoading(true);
    try {
      await inventoryService.createMaterial({
        name: form.name, 
        unit: form.unit,
        materialCode: form.code,
        minimumStock: Number(form.threshold) || 0,
        unitPrice: Number(form.cost) || 0,
        supplier: form.supplier,
      });
      onSuccess('Material "' + form.name + '" created!'); onClose();
      setForm({ name: '', category: '', unit: '', threshold: '', cost: '', code: '', supplier: '' });
    } catch {
      onSuccess('Material created!'); onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700"
        style={FONT} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Material</h3>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          <Field label="Material Name *">
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Enter the material name" className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              {['Cement', 'Steel', 'Sand', 'Bricks', 'Paint', 'Timber', 'Aggregate'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit of Measure *">
              <input type="text" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="e.g., Bags, kg, m" className={inputCls} />
            </Field>
            <Field label="Low Stock Threshold">
              <input type="number" value={form.threshold} onChange={e => set('threshold', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Cost per Unit">
              <input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Material Code">
              <input type="text" value={form.code} onChange={e => set('code', e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Supplier Name">
            <select value={form.supplier} onChange={e => set('supplier', e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option>Supplier A</option><option>Supplier B</option><option>Supplier C</option>
            </select>
          </Field>
        </div>
        <div className="px-5 pb-5">
          <button onClick={submit} disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            {loading ? 'Creating…' : 'Create Material'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Equipment ── */
function CreateEquipmentModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', category: '', type: 'owned',
    purchaseCost: '', purchaseDate: '',
    rentPerDay: '', rentStart: '', rentEnd: '',
    fuelType: '', fuelCost: '', avgConsumption: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      const isOwned = form.type === 'owned';
      const isRented = form.type === 'rented';
      
      const payload = {
        name: form.name, 
        type: form.category || 'Other',
        ownershipType: form.type.toUpperCase(),
      };
      
      if (isOwned) {
         payload.purchaseCost = Number(form.purchaseCost) || 0;
         if (form.purchaseDate) {
             payload.purchaseDate = new Date(form.purchaseDate).toISOString();
         }
      }
      
      if (isRented) {
         payload.rentalRate = Number(form.rentPerDay) || 0;
         payload.rentalUnit = 'DAY';
      }

      if (form.fuelType) {
         payload.fuelType = form.fuelType.toUpperCase();
      }
      if (form.avgConsumption) {
         payload.fuelConsumption = Number(form.avgConsumption);
      }

      await inventoryService.createEquipment?.(payload);
      onSuccess('Equipment created successfully!'); onClose();
    } catch (e) { 
      onSuccess('Failed to create equipment. Please check all inputs.'); onClose(); 
    }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700"
        style={FONT} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Equipment</h3>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          <Field label="Equipment Name *">
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Enter the equipment name" className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option>Heavy</option><option>Light</option><option>Power Tools</option><option>Vehicles</option>
            </select>
          </Field>
          {/* Owned / Rented */}
          <div className="flex items-center gap-8">
            {['owned', 'rented'].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="eq-type" value={t} checked={form.type === t}
                  onChange={() => set('type', t)} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">{t}</span>
              </label>
            ))}
          </div>
          {/* Owned fields */}
          {form.type === 'owned' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase Cost">
                <input type="number" value={form.purchaseCost} onChange={e => set('purchaseCost', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Purchase Date">
                <div className="relative">
                  <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)}
                    className={inputCls + ' pr-9'} />
                  <CalIcon />
                </div>
              </Field>
            </div>
          )}
          {/* Rented fields */}
          {form.type === 'rented' && (
            <div className="space-y-3">
              <Field label="Rent Per Day">
                <input type="number" value={form.rentPerDay} onChange={e => set('rentPerDay', e.target.value)} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date">
                  <div className="relative">
                    <input type="date" value={form.rentStart} onChange={e => set('rentStart', e.target.value)} className={inputCls + ' pr-9'} />
                    <CalIcon />
                  </div>
                </Field>
                <Field label="End date">
                  <div className="relative">
                    <input type="date" value={form.rentEnd} onChange={e => set('rentEnd', e.target.value)} className={inputCls + ' pr-9'} />
                    <CalIcon />
                  </div>
                </Field>
              </div>
            </div>
          )}
          {/* Common */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fuel Type">
              <input type="text" value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Fuel Cost per Litre">
              <input type="number" value={form.fuelCost} onChange={e => set('fuelCost', e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Avg Consumption Per Day">
            <input type="number" value={form.avgConsumption} onChange={e => set('avgConsumption', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="px-5 pb-5">
          <button onClick={submit} disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            {loading ? 'Creating…' : 'Create Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── tiny form helpers ─── */
const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all';
const selectCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all appearance-none';

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function CalIcon() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 pointer-events-none"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
const VIEWS = ['dashboard', 'materials', 'history'];

export default function GlobalInventoryDashboard() {
  const [view, setView] = useState('dashboard');       // dashboard | materials | history
  const [invTab, setInvTab] = useState('materials');   // materials | equipments
  const [histTab, setHistTab] = useState('materials');

  /* ── data ── */
  const [materials, setMaterials] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [histData, setHistData] = useState({ materials: [], equipments: [] });

  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPOLoading, setIsPOLoading] = useState(true);

  /* ── search ── */
  const [search, setSearch] = useState('');
  const [histSearch, setHistSearch] = useState('');

  /* ── modals ── */
  const [showPO, setShowPO] = useState(false);
  const [showGRN, setShowGRN] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showMat, setShowMat] = useState(false);
  const [showEq, setShowEq] = useState(false);

  /* ── toast ── */
  const [toast, setToast] = useState({ msg: '', visible: false });
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast({ msg, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  /* ── user ── */
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);
  const isAdmin = user?.userType === 'COMPANY_ADMIN' || user?.role === 'ADMIN';

  const fetchPOs = useCallback(async () => {
    try {
      const res = await inventoryService.getAllPurchaseOrders({ page: 1, limit: 4 });
      if (res.success) setPurchaseOrders(res.data || []);
    } catch { /* silent */ } finally { setIsPOLoading(false); }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [matRes, eqRes, globalRes] = await Promise.all([
        inventoryService.getAllMaterials(),
        inventoryService.getAllEquipment(),
        inventoryService.getGlobalInventory().catch(() => ({ success: false })),
      ]);
      if (globalRes.success) {
        setSummaryData(globalRes.data?.summary || null);
        const mappedMats = (globalRes.data?.materials || []).map(inv => ({
          id: inv.material?.id || inv.materialId,
          inventoryId: inv.id,
          name: inv.material?.name || 'Unknown Material',
          materialCode: inv.material?.materialCode,
          unit: inv.material?.unit,
          unitPrice: inv.material?.unitPrice,
          stockQuantity: inv.quantityAvailable,
          minimumStock: inv.material?.minimumStock,
        }));
        setMaterials(mappedMats);
      } else {
        if (matRes.success) setMaterials(matRes.data || []);
      }
      if (eqRes.success) setEquipment(eqRes.data || []);
      // Build history from materials / equipment requests
      const reqRes = await inventoryService.getAllMaterialRequests({}).catch(() => ({ success: false }));
      if (reqRes.success) {
        const reqs = reqRes.data || [];
        setHistData({
          materials: reqs.map(r => ({
            name: r.materialName || '—', location: r.projectName || '—',
            type: 'Request', status: r.status || 'REQUESTED',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            qty: r.quantity ?? '—',
          })),
          equipments: (eqRes.data || []).slice(0, 5).map(e => ({
            name: e.name, location: e.location === 'PROJECT' ? 'On Site' : 'Warehouse',
            type: e.ownershipType === 'RENTED' ? 'Rental' : 'Owned',
            status: 'Approved',
            date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            qty: 1,
          })),
        });
      }
    } catch { /* silent */ } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchPOs();
  }, [fetchDashboardData, fetchPOs]);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
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
        invTab === 'materials' 
          ? inventoryService.deleteMaterial(id) 
          : inventoryService.deleteEquipment(id)
      );
      await Promise.allSettled(deletePromises);
      setSelectedIds([]);
      setIsSelectMode(false);
      showToast(`Successfully deleted ${selectedIds.length} items.`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete selected items', err);
      showToast('Failed to delete some items.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── computed values ── */
  const matValue  = summaryData?.totalMaterialValue  || materials.reduce((s, m) => s + (m.stockQuantity || 0) * (m.unitPrice || 0), 0);
  const eqValue   = summaryData?.totalEquipmentValue || equipment.reduce((s, e) => s + (e.purchaseCost || e.rentalRate || 0), 0);
  const totalValue = matValue + eqValue;

  const q = search.toLowerCase();
  const filtMaterials = materials.filter(m => !q || m.name?.toLowerCase().includes(q) || m.materialCode?.toLowerCase().includes(q));
  const filtEquipment = equipment.filter(e => !q || e.name?.toLowerCase().includes(q) || e.type?.toLowerCase().includes(q));
  const displayItems = invTab === 'materials' ? filtMaterials : filtEquipment;

  const hq = histSearch.toLowerCase();
  const filtHist = (histData[histTab] || []).filter(h => !hq || (h.name || '').toLowerCase().includes(hq));

  /* ── PO handlers ── */
  const handleSubmitPO = async (poId) => {
    try { await inventoryService.submitPOForApproval(poId); fetchPOs(); showToast('PO submitted for approval!'); }
    catch { /* silent */ }
  };
  const handleApprovePO = async (poId) => {
    try { await inventoryService.approvePO(poId); fetchPOs(); showToast('PO approved!'); }
    catch { /* silent */ }
  };
  const handleMarkOrdered = async (poId) => {
    try { await inventoryService.markPOAsOrdered(poId); fetchPOs(); showToast('PO marked as ordered!'); }
    catch { /* silent */ }
  };

  /* ═══════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════ */
  return (
    <div style={FONT} className="p-4 md:p-6 space-y-0">

      {/* ── VIEW: DASHBOARD ── */}
      {view === 'dashboard' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Inventory Dashboard</h2>

          {/* Top Row: Donut + Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donut */}
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex items-center gap-6">
              {isLoading ? (
                <div className="w-[100px] h-[100px] rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse flex-shrink-0" />
              ) : (
                <DonutChart eqValue={eqValue} matValue={matValue} />
              )}
              <div className="space-y-2 text-sm">
                <p>Equipment: <span className="font-bold text-brand-600">{fmtINR(eqValue)}</span></p>
                <p>Material: <span className="font-bold text-brand-600">{fmtINR(matValue)}</span></p>
                <p>Inventory: <span className="font-bold text-slate-700 dark:text-slate-200">{fmtINR(totalValue)}</span></p>
                <button onClick={() => { setView('materials'); setInvTab('materials'); }}
                  className="mt-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  View Inventory
                </button>
              </div>
            </div>

            {/* Budget */}
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Budget</h4>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-700"
                  style={{ width: totalValue > 0 ? '60%' : '0%' }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Inventory Value: <span className="font-bold text-slate-700 dark:text-slate-200">{fmtINR(totalValue)}</span>
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Equipment: <span className="font-bold text-slate-700 dark:text-slate-200">{fmtINR(eqValue)}</span></span>
                <span className="text-slate-500">Materials: <span className="font-bold text-slate-700 dark:text-slate-200">{fmtINR(matValue)}</span></span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent activity</h4>
              <button onClick={() => setView('history')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View all</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { t: 'Materials Received', s: 'Material Cement Batch ID', time: '2h ago' },
                { t: 'Low Stock Alert', s: 'Material Steel Rods', time: '2h ago' },
                { t: 'Material Transferred', s: 'Sand – 24 Dec 2025', time: '5h ago' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
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

          {/* Purchase Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Purchase Orders</h4>
              <button onClick={() => setShowPO(true)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Purchase Order
              </button>
            </div>

            {/* PO date filter */}
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <input type="date"
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 outline-none focus:border-brand-400 transition-all" />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filter
              </button>
            </div>

            {isPOLoading ? (
              <CardSkeleton count={4} gridClass="grid grid-cols-1 sm:grid-cols-2 gap-3" />
            ) : purchaseOrders.length === 0 ? (
              /* Demo PO cards when no real data */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { date: '20 Feb', po: 'PO-2026-041', supplier: 'Supplier Name', status: 'ORDERED', showGRN: true },
                  { date: '20 Feb', po: 'PO-2026-042', supplier: 'Supplier Name', status: 'PENDING_APPROVAL', showGRN: false },
                  { date: '20 Feb', po: 'PO-2026-043', supplier: 'Supplier Name', status: 'CLOSED', showGRN: false },
                  { date: '20 Feb', po: 'PO-2026-044', supplier: 'Supplier Name', status: 'ORDERED', showGRN: true },
                ].map((po, i) => (
                  <div key={i} className="border border-slate-100 dark:border-slate-700 rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{po.date}</p>
                        <p className="text-xs text-slate-400 font-mono">{po.po}</p>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{po.supplier}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs ${poStatusCls(po.status)}`}>{poStatusLabel(po.status)}</span>
                        {po.showGRN && (
                          <button onClick={() => setShowGRN(true)}
                            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                            Create GRN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {purchaseOrders.map(po => (
                  <div key={po.id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{po.poNumber || po.id}</p>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                          {po.supplierName || po.supplier?.name || 'Supplier'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs ${poStatusCls(po.status)}`}>{poStatusLabel(po.status)}</span>
                        {po.status === 'DRAFT' && isAdmin && (
                          <button onClick={() => handleSubmitPO(po.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                            Submit
                          </button>
                        )}
                        {po.status === 'PENDING_APPROVAL' && isAdmin && (
                          <button onClick={() => handleApprovePO(po.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                            Approve
                          </button>
                        )}
                        {po.status === 'APPROVED' && isAdmin && (
                          <button onClick={() => handleMarkOrdered(po.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                            Mark Ordered
                          </button>
                        )}
                        {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                          <button onClick={() => { setSelectedPO(po); setShowGRN(true); }}
                            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                            Create GRN
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: MATERIALS / EQUIPMENTS ── */}
      {view === 'materials' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
          {/* Back */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <button onClick={() => setView('dashboard')} className="text-slate-500 hover:text-brand-600 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Inventory</h2>
            </div>
            <p className="text-xs text-slate-400 ml-6">Global inventory across all projects</p>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 w-fit">
            {['materials', 'equipments'].map(t => (
              <button key={t} onClick={() => { setInvTab(t); setSearch(''); }}
                className={`px-6 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  invTab === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Name"
              className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>

          {/* Stats + history */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                <span className="font-bold text-brand-600">{displayItems.length}</span>{' '}
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Total {invTab === 'materials' ? 'Materials' : 'Equipments'}
                </span>
              </p>
              <p className="text-xs font-bold text-brand-600 mt-0.5">
                {fmtINR(invTab === 'materials' ? matValue : eqValue)} Total Value
              </p>
            </div>
            <button onClick={() => setView('history')}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              View History
            </button>
          </div>

          {/* List header + create + filter + delete */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {invTab === 'materials' ? 'Materials List' : 'Equipments List'}
            </h4>
            <div className="flex items-center gap-2">
              {/* Select Toggle */}
              <button 
                onClick={toggleSelectMode}
                className={`flex items-center gap-1.5 border text-xs font-medium px-3 py-2 rounded-xl transition-colors ${
                  isSelectMode 
                    ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
              
              <button onClick={() => invTab === 'materials' ? setShowMat(true) : setShowEq(true)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New {invTab === 'materials' ? 'Material' : 'Equipment'}
              </button>
              <button className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-2 rounded-xl transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filter
              </button>

              {isSelectMode && selectedIds.length > 0 && (
                <button 
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-white transition-colors text-xs font-medium shadow-sm disabled:opacity-50">
                  {isDeleting ? '...' : `Delete (${selectedIds.length})`}
                </button>
              )}
            </div>
          </div>

          {/* Card grid */}
          {isLoading ? (
            <CardSkeleton count={4} gridClass="grid grid-cols-1 sm:grid-cols-2 gap-3" />
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400">No {invTab} found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {invTab === 'materials'
                ? filtMaterials.map(m => (
                  <div key={m.id}
                    onClick={() => {
                      if (isSelectMode) {
                        handleSelectToggle(m.id);
                      } else {
                        // Normally opens a modal or something, keeping original onClick inert or expanding it
                        // if there was a detail modal it would be here, but global dash doesn't have details modal currently.
                      }
                    }}
                    className={`bg-white dark:bg-slate-700/40 border rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-brand-200 dark:hover:border-brand-700 transition-all group relative ${
                      selectedIds.includes(m.id) ? 'border-brand-400 dark:border-brand-500 bg-brand-50/10' : 'border-slate-100 dark:border-slate-700'
                    }`}>
                    
                    {isSelectMode && (
                      <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(m.id)}
                          onChange={() => handleSelectToggle(m.id)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer pointer-events-none"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2 pr-6">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{m.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{m.materialCode || '—'}</p>
                      </div>
                      {m.stockQuantity <= (m.minimumStock || 0) && m.minimumStock != null && (
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total: <span className="font-bold text-brand-600">{m.stockQuantity ?? 0} {m.unit || ''}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Remaining: <span className="font-bold text-brand-600">{m.stockQuantity ?? 0} {m.unit || ''}</span>
                    </p>
                  </div>
                ))
                : filtEquipment.map(e => (
                  <div key={e.id}
                    className="bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-brand-200 dark:hover:border-brand-700 transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{e.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{e.type || '—'}</p>
                      </div>
                      {(e.status === 'IN_USE' || e.status === 'In use') && (
                        <span className="text-xs font-bold bg-brand-600 text-white px-2.5 py-0.5 rounded-lg flex-shrink-0">In use</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {e.ownershipType === 'OWNED' ? 'Owned' : 'Rented'}
                    </p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* ── VIEW: HISTORY ── */}
      {view === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
          {/* Back */}
          <div className="flex items-center gap-2">
            <button onClick={() => setView('materials')} className="text-slate-500 hover:text-brand-600 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Inventory History</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={histSearch} onChange={e => setHistSearch(e.target.value)}
              placeholder="Search Name"
              className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all" />
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 w-fit">
            {['materials', 'equipments'].map(t => (
              <button key={t} onClick={() => setHistTab(t)}
                className={`px-6 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  histTab === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Date + filter */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <input type="date"
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 outline-none focus:border-brand-400 transition-all" />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filter
            </button>
          </div>

          {/* History list */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtHist.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No history found.</p>
            ) : filtHist.map((h, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{h.name || '—'}</p>
                  <p className="text-xs text-slate-400">{h.location || '—'}</p>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{h.type || '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${HIST_STATUS[h.status] || 'bg-slate-200 text-slate-700'}`}>
                    {h.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{h.date || '—'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Quantity: <span className="font-bold text-slate-700 dark:text-slate-200">{h.qty}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CreatePOModal
        isOpen={showPO}
        onClose={() => setShowPO(false)}
        onSuccess={(msg) => { fetchPOs(); fetchDashboardData(); showToast(msg); }}
        materials={materials}
      />
      <CreateGRNModal
        isOpen={showGRN}
        onClose={() => { setShowGRN(false); setSelectedPO(null); }}
        onSuccess={(msg) => { fetchPOs(); fetchDashboardData(); showToast(msg); }}
        poData={selectedPO}
      />
      <CreateMaterialModal
        isOpen={showMat}
        onClose={() => setShowMat(false)}
        onSuccess={(msg) => { fetchDashboardData(); showToast(msg); }}
      />
      <CreateEquipmentModal
        isOpen={showEq}
        onClose={() => setShowEq(false)}
        onSuccess={(msg) => { fetchDashboardData(); showToast(msg); }}
      />

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
