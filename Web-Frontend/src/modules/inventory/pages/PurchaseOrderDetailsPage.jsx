// src/modules/inventory/pages/PurchaseOrderDetailsPage.jsx
// Route: /admin/inventory/po/:id
// Mirrors purchase_order_details_screen.dart: header card, financial summary,
// line items, goods receipts section, bottom action bar per PO status.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';

const fmtCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

const STATUS_META = {
  DRAFT:              { label: 'Draft',              color: '#64748B', bg: '#F1F5F9' },
  PENDING_APPROVAL:   { label: 'Pending Approval',   color: '#F59E0B', bg: '#FFF7ED' },
  APPROVED:           { label: 'Approved',           color: '#3B82F6', bg: '#EFF6FF' },
  ORDERED:            { label: 'Ordered',            color: '#8B5CF6', bg: '#F5F3FF' },
  PARTIALLY_RECEIVED: { label: 'Partially Received', color: '#8B5CF6', bg: '#F5F3FF' },
  RECEIVED:           { label: 'Received',           color: '#10B981', bg: '#ECFDF5' },
  PARTIALLY_PAID:     { label: 'Partially Paid',     color: '#10B981', bg: '#ECFDF5' },
  PAID:               { label: 'Paid',               color: '#10B981', bg: '#ECFDF5' },
  CLOSED:             { label: 'Closed',             color: '#10B981', bg: '#ECFDF5' },
  CANCELLED:          { label: 'Cancelled',          color: '#EF4444', bg: '#FEF2F2' },
  REJECTED:           { label: 'Rejected',           color: '#EF4444', bg: '#FEF2F2' },
};

const GRN_STATUS_COLOR = { PENDING: '#F59E0B', PASSED: '#10B981', FAILED: '#EF4444' };

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 text-base">{icon}</span>
      <span className="text-gray-500 w-28 shrink-0">{label}:</span>
      <span className="font-semibold text-gray-800">{value || 'N/A'}</span>
    </div>
  );
}

export default function PurchaseOrderDetailsPage() {
  const { id: poId } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  // Dialog state
  const [dialog, setDialog] = useState(null); // { type: 'approve'|'reject'|'cancel', resolve }
  const [dialogNotes, setDialogNotes] = useState('');

  const loadPO = useCallback(async () => {
    try {
      const res = await inventoryService.getPurchaseOrderById(poId);
      const data = res.data || res;
      setPo(data);
      // Load GRNs
      try {
        const grRes = await inventoryService.getPOGoodsReceipts(poId);
        setReceipts(Array.isArray(grRes.data) ? grRes.data : []);
      } catch { setReceipts([]); }
    } catch (e) {
      alert('Failed to load PO: ' + e.message);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [poId, navigate]);

  useEffect(() => { loadPO(); }, [loadPO]);

  const act = async (fn, successMsg) => {
    setIsActing(true);
    try { await fn(); if (successMsg) alert(successMsg); await loadPO(); }
    catch (e) { alert('Error: ' + e.message); }
    finally { setIsActing(false); }
  };

  const openDialog = (type) => { setDialog(type); setDialogNotes(''); };
  const closeDialog = () => { setDialog(null); setDialogNotes(''); };

  const handleDialogSubmit = async () => {
    if ((dialog === 'reject' || dialog === 'cancel') && !dialogNotes.trim()) return alert('Reason is required');
    closeDialog();
    if (dialog === 'approve') await act(() => inventoryService.approvePO(poId, { notes: dialogNotes || undefined }), 'PO Approved');
    if (dialog === 'reject') await act(() => inventoryService.rejectPO(poId, { rejectionReason: dialogNotes }), 'PO Rejected');
    if (dialog === 'cancel') await act(() => inventoryService.cancelPO(poId, { cancellationReason: dialogNotes }), 'PO Cancelled');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <svg className="animate-spin h-8 w-8 text-[#0D6EFD]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
    </div>
  );
  if (!po) return null;

  const status = po.status || 'DRAFT';
  const meta = STATUS_META[status] || { label: status, color: '#64748B', bg: '#F1F5F9' };
  const canEdit = status === 'DRAFT' || status === 'PENDING_APPROVAL';
  const canDelete = status === 'DRAFT';
  const totalPaid = po.totalPaid || 0;
  const totalAmount = po.totalAmount || po.grandTotal || 0;
  const paymentPct = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28">
      {/* Header */}
      <div className="bg-[#0D6EFD] sticky top-0 z-10 flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="text-white font-bold text-[16px]">PO Details</span>
        </div>
        <div className="flex gap-1">
          {canEdit && (
            <button onClick={() => navigate(`/admin/inventory/po/${poId}/edit`, { state: { po } })} className="text-white hover:bg-white/10 p-2 rounded-full" title="Edit PO">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          )}
          {canDelete && (
            <button onClick={() => { if (window.confirm('Permanently delete this Purchase Order?')) act(() => inventoryService.deletePurchaseOrder(poId), 'Deleted').then(() => navigate(-1)); }} className="text-white hover:bg-white/10 p-2 rounded-full" title="Delete PO">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Header Card ──────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[#0D6EFD] font-bold text-lg">{po.poNumber}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{po.title}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ color: meta.color, backgroundColor: meta.bg }}>{meta.label}</span>
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <InfoRow icon="🏭" label="Supplier" value={po.supplierName} />
            <InfoRow icon="🏗️" label="Project" value={po.project?.name} />
            <InfoRow icon="📅" label="Order Date" value={fmtDate(po.orderDate || po.createdAt)} />
            <InfoRow icon="💳" label="Payment Terms" value={po.paymentTerm} />
            {po.expectedDelivery && <InfoRow icon="📦" label="Expected Delivery" value={fmtDate(po.expectedDelivery)} />}
          </div>
        </div>

        {/* ── Financial Summary ──────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3">Financial Summary</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmtCurrency(po.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tax ({po.taxRate || 0}%)</span><span className="font-medium">{fmtCurrency(po.taxAmount)}</span></div>
            {(po.shippingCost || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="font-medium">{fmtCurrency(po.shippingCost)}</span></div>}
            <div className="border-t border-gray-200 pt-2 flex justify-between"><span className="font-bold text-base text-gray-800">Grand Total</span><span className="font-bold text-lg text-[#0D6EFD]">{fmtCurrency(totalAmount)}</span></div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-[#00B48A] h-2 rounded-full transition-all" style={{ width: `${paymentPct}%` }}></div></div>
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Paid: {fmtCurrency(totalPaid)}</span><span>Due: {fmtCurrency(totalAmount - totalPaid)}</span></div>
            </div>
          </div>
        </div>

        {/* ── Line Items ──────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Line Items</h3>
            <span className="text-gray-400 text-sm">{(po.items || []).length} items</span>
          </div>
          {(po.items || []).map((item, i) => (
            <div key={item.id || i} className="border border-gray-100 rounded-xl p-3 mb-2 last:mb-0">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800 text-sm flex-1 pr-2">{item.description || item.name}</p>
                <p className="font-bold text-[#0D6EFD] text-sm">{fmtCurrency(item.totalPrice || item.total)}</p>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Order: {item.quantity} {item.unit}</span>
                <span>@ {fmtCurrency(item.unitPrice)}/{item.unit}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[#00B48A]">Received: {item.receivedQuantity || 0} {item.unit}</span>
                <span className={`${(item.pendingQuantity || 0) > 0 ? 'text-orange-500' : 'text-gray-400'}`}>Pending: {item.pendingQuantity || 0} {item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Goods Receipts (GRN) ──────────────────── */}
        {receipts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Goods Receipts (GRN)</h3>
              <span className="text-gray-400 text-sm">{receipts.length} receipts</span>
            </div>
            {receipts.map((receipt) => {
              const showAcceptReject = receipt.inspectionStatus === 'PENDING';
              const showUpdateStock = receipt.inspectionStatus === 'PASSED' && !receipt.stockUpdated;
              const grColor = GRN_STATUS_COLOR[receipt.inspectionStatus] || '#64748B';
              return (
                <div key={receipt.id} className="border border-gray-100 rounded-xl mb-3 last:mb-0 overflow-hidden">
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#0D6EFD] text-sm">{receipt.grNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Date: {fmtDate(receipt.receiptDate || receipt.createdAt)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: grColor }}></span>
                          <span className="text-xs font-medium" style={{ color: grColor }}>{receipt.inspectionStatus || 'PENDING'}</span>
                          {receipt.stockUpdated && <span className="ml-2 text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">STOCK UPDATED</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {(showAcceptReject || showUpdateStock) && (
                    <div className="border-t border-gray-100 px-3 py-2 flex justify-end gap-2">
                      {showAcceptReject && (
                        <>
                          <button onClick={() => { if (window.confirm(`Reject GRN ${receipt.grNumber}?`)) { const reason = prompt('Rejection reason (required):'); if (reason) act(() => inventoryService.rejectGRN(receipt.id, poId, reason), 'GRN Rejected'); } }} className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Reject</button>
                          <button onClick={() => { if (window.confirm(`Accept all items in ${receipt.grNumber}?`)) act(() => inventoryService.acceptGRN(receipt.id, poId), 'GRN Accepted'); }} className="px-3 py-1.5 text-xs font-bold text-white bg-[#00B48A] rounded-lg hover:bg-green-600">Accept GRN</button>
                        </>
                      )}
                      {showUpdateStock && (
                        <button onClick={() => { if (window.confirm('Update inventory stock and record budget expense from this GRN?')) act(() => inventoryService.updateStockFromReceipt(receipt.id, poId), 'Stock & Budget Updated!'); }} className="px-3 py-1.5 text-xs font-bold text-white bg-[#0D6EFD] rounded-lg hover:bg-blue-700 flex items-center gap-1">📦 Update Stock &amp; Budget</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Action Bar ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3 md:left-64">
        {status === 'DRAFT' && (
          <button onClick={() => act(() => inventoryService.submitPOForApproval(poId), 'Submitted for Approval')} disabled={isActing} className="flex-1 py-3 bg-[#0D6EFD] text-white font-bold rounded-xl text-sm disabled:opacity-50">
            {isActing ? 'Processing...' : 'Submit for Approval'}
          </button>
        )}
        {status === 'PENDING_APPROVAL' && (
          <>
            <button onClick={() => openDialog('reject')} disabled={isActing} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl text-sm hover:bg-red-50 disabled:opacity-50">Reject</button>
            <button onClick={() => openDialog('approve')} disabled={isActing} className="flex-1 py-3 bg-[#00B48A] text-white font-bold rounded-xl text-sm disabled:opacity-50">Approve</button>
          </>
        )}
        {status === 'APPROVED' && (
          <>
            <button onClick={() => openDialog('cancel')} disabled={isActing} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl text-sm hover:bg-red-50 disabled:opacity-50">Cancel PO</button>
            <button onClick={() => act(() => inventoryService.markAsOrdered(poId), 'Marked as Ordered')} disabled={isActing} className="flex-1 py-3 bg-[#0D6EFD] text-white font-bold rounded-xl text-sm disabled:opacity-50">{isActing ? 'Processing...' : 'Mark Ordered'}</button>
          </>
        )}
        {(status === 'ORDERED' || status === 'PARTIALLY_RECEIVED') && (
          <>
            <button onClick={() => { if (window.confirm('Mark as fully received? Inventory will NOT be auto-updated.')) act(() => inventoryService.markAsReceived(poId), 'Marked as Received'); }} disabled={isActing} className="flex-1 py-3 border-2 border-orange-500 text-orange-500 font-bold rounded-xl text-sm hover:bg-orange-50 disabled:opacity-50">Mark Received</button>
            <button onClick={() => navigate(`/admin/inventory/po/${poId}/grn`)} className="flex-1 py-3 bg-[#00B48A] text-white font-bold rounded-xl text-sm">Create GRN</button>
          </>
        )}
        {(status === 'RECEIVED' || status === 'PARTIALLY_PAID') && (
          <button onClick={() => act(() => inventoryService.closePO(poId), 'PO Closed')} disabled={isActing} className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-xl text-sm disabled:opacity-50">{isActing ? 'Processing...' : 'Close PO'}</button>
        )}
      </div>

      {/* ── Dialog Modal ──────────────────────────── */}
      {dialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3 capitalize">{dialog === 'approve' ? 'Approve PO' : dialog === 'reject' ? 'Reject PO' : 'Cancel PO'}</h3>
            <textarea value={dialogNotes} onChange={e => setDialogNotes(e.target.value)} rows={3} placeholder={dialog === 'approve' ? 'Approval notes (optional)' : 'Reason (required)'} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={closeDialog} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm">Cancel</button>
              <button onClick={handleDialogSubmit} className={`flex-1 py-3 text-white font-bold rounded-xl text-sm ${dialog === 'approve' ? 'bg-[#00B48A]' : 'bg-red-500'}`}>{dialog === 'approve' ? 'Approve' : dialog === 'reject' ? 'Reject' : 'Cancel PO'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
