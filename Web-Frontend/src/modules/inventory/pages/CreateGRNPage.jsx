import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';

const QUALITY_OPTS = ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'REJECT'];

export default function CreateGRNPage() {
  const { id: poId } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [deliveryChallanNo, setDeliveryChallanNo] = useState('');
  const [notes, setNotes] = useState('');
  const [receivedItems, setReceivedItems] = useState({}); // { poItemId: { receivedQuantity, qualityRating } }

  useEffect(() => {
    inventoryService.getPurchaseOrderById(poId)
      .then(res => {
        const poData = res.data || res;
        setPo(poData);
        const pItems = (poData.items || []).filter(item => (item.pendingQuantity || 0) > 0);
        setPendingItems(pItems);
        
        // Initialize state
        const initial = {};
        pItems.forEach(item => {
          initial[item.id] = {
            receivedQuantity: item.pendingQuantity || 0,
            qualityRating: 'GOOD'
          };
        });
        setReceivedItems(initial);
        setIsLoading(false);
      })
      .catch(e => {
        alert('Failed to load PO: ' + e.message);
        navigate(-1);
      });
  }, [poId, navigate]);

  const handleItemChange = (itemId, field, value) => {
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryChallanNo.trim()) return alert('Delivery Challan Number is required');
    
    // Filter out items with 0 received quantity
    const itemsToSubmit = pendingItems
      .filter(item => {
        const qty = parseFloat(receivedItems[item.id]?.receivedQuantity);
        return qty > 0;
      })
      .map(item => ({
        poItemId: item.id,
        receivedQuantity: parseFloat(receivedItems[item.id].receivedQuantity),
        qualityRating: receivedItems[item.id].qualityRating
      }));

    if (itemsToSubmit.length === 0) return alert('At least one item must have a received quantity > 0');

    setIsSubmitting(true);
    try {
      await inventoryService.createGoodsReceipt(poId, {
        deliveryChallanNo,
        notes,
        items: itemsToSubmit
      });
      alert('Goods Receipt created successfully');
      navigate(-1);
    } catch (e) {
      alert('Error creating GRN: ' + e.message);
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-[#00B48A] sticky top-0 z-10 flex items-center px-4 py-4 shadow-md">
        <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1.5 rounded-full mr-3 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-white text-[17px] font-bold">Create Goods Receipt (GRN)</h1>
          <p className="text-green-100 text-xs">PO: {po.poNumber}</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Receipt Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Delivery Challan No *</label>
                <input 
                  type="text" 
                  value={deliveryChallanNo} 
                  onChange={e => setDeliveryChallanNo(e.target.value)} 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00B48A] focus:ring-1 focus:ring-[#00B48A]" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-600 block mb-1">Remarks / Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  rows={2} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00B48A] focus:ring-1 focus:ring-[#00B48A] resize-none" 
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-800">Pending Items</h3>
              <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{pendingItems.length} Items</span>
            </div>
            
            {pendingItems.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No pending items to receive for this PO.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-bold">
                    <tr>
                      <th className="px-3 py-2 rounded-tl-lg">Particulars</th>
                      <th className="px-3 py-2 w-24">Pending</th>
                      <th className="px-3 py-2 w-32">Received Qty</th>
                      <th className="px-3 py-2 w-36 rounded-tr-lg">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gray-800">{item.description || item.name}</p>
                        </td>
                        <td className="px-3 py-3 font-medium text-orange-500">
                          {item.pendingQuantity} {item.unit}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              step="0.01"
                              max={item.pendingQuantity}
                              min="0"
                              value={receivedItems[item.id]?.receivedQuantity ?? ''}
                              onChange={e => handleItemChange(item.id, 'receivedQuantity', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#00B48A]"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={receivedItems[item.id]?.qualityRating ?? 'GOOD'}
                            onChange={e => handleItemChange(item.id, 'qualityRating', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#00B48A] bg-white"
                          >
                            {QUALITY_OPTS.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3 pb-8">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || pendingItems.length === 0} className="flex-1 py-3 bg-[#00B48A] text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Creating GRN...' : 'Submit GRN'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
