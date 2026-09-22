import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';

export default function EditPOPage() {
  const { id: poId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [po, setPo] = useState(location.state?.po || null);
  const [isLoading, setIsLoading] = useState(!po);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    expectedDelivery: '',
    actualDelivery: '',
    shippingCost: '',
    otherCharges: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    paymentTerm: '',
    notes: '',
  });

  useEffect(() => {
    if (!po) {
      inventoryService.getPurchaseOrderById(poId)
        .then(res => {
          setPo(res.data || res);
          setIsLoading(false);
        })
        .catch(e => {
          alert('Failed to load PO: ' + e.message);
          navigate(-1);
        });
    }
  }, [poId, po, navigate]);

  useEffect(() => {
    if (po) {
      setForm({
        title: po.title || '',
        description: po.description || '',
        expectedDelivery: po.expectedDelivery ? po.expectedDelivery.split('T')[0] : '',
        actualDelivery: po.actualDelivery ? po.actualDelivery.split('T')[0] : '',
        shippingCost: po.shippingCost || '',
        otherCharges: po.otherCharges || '',
        deliveryAddress: po.deliveryAddress || '',
        deliveryInstructions: po.deliveryInstructions || '',
        paymentTerm: po.paymentTerm || '',
        notes: po.notes || '',
      });
    }
  }, [po]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form };
      if (payload.shippingCost) payload.shippingCost = parseFloat(payload.shippingCost);
      if (payload.otherCharges) payload.otherCharges = parseFloat(payload.otherCharges);
      
      await inventoryService.updatePurchaseOrder(poId, payload);
      alert('Purchase Order updated successfully');
      navigate(-1);
    } catch (e) {
      alert('Error updating PO: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <svg className="animate-spin h-8 w-8 text-[#0D6EFD]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28">
      {/* Header */}
      <div className="bg-[#0D6EFD] sticky top-0 z-10 flex items-center px-4 py-4 shadow-md">
        <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1.5 rounded-full mr-3 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-white text-[17px] font-bold">Edit Purchase Order</h1>
          <p className="text-blue-200 text-xs">{po.poNumber}</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* Read-only Context */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Order Context</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block">PO Number</span><span className="font-semibold">{po.poNumber}</span></div>
            <div><span className="text-gray-500 block">Status</span><span className="font-semibold">{po.status}</span></div>
            <div><span className="text-gray-500 block">Supplier</span><span className="font-semibold">{po.supplierName || po.supplier?.name}</span></div>
            <div><span className="text-gray-500 block">Project</span><span className="font-semibold">{po.project?.name}</span></div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD] resize-none" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Expected Delivery</label>
                <input type="date" value={form.expectedDelivery} onChange={e => setForm({...form, expectedDelivery: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Actual Delivery</label>
                <input type="date" value={form.actualDelivery} onChange={e => setForm({...form, actualDelivery: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Shipping Cost (₹)</label>
                <input type="number" step="0.01" value={form.shippingCost} onChange={e => setForm({...form, shippingCost: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Other Charges (₹)</label>
                <input type="number" step="0.01" value={form.otherCharges} onChange={e => setForm({...form, otherCharges: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Delivery Address</label>
              <textarea value={form.deliveryAddress} onChange={e => setForm({...form, deliveryAddress: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD] resize-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Delivery Instructions</label>
              <textarea value={form.deliveryInstructions} onChange={e => setForm({...form, deliveryInstructions: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD] resize-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Payment Terms</label>
              <input type="text" value={form.paymentTerm} onChange={e => setForm({...form, paymentTerm: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD]" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D6EFD] focus:ring-1 focus:ring-[#0D6EFD] resize-none" />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#0D6EFD] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
