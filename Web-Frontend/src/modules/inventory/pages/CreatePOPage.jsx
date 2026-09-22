// src/modules/inventory/pages/CreatePOPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';

const CreatePOPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplierId: '', location: '', expectedDate: '', gstPercent: '', materialId: '', quantity: '', totalAmount: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting PO:", formData);
    navigate('/inventory/po');
  };

  return (
    <PageContainer title="Create Purchase Order">
      
      {/* We constrain the form width so it doesn't look stretched on large monitors */}
      <div className="max-w-3xl bg-white md:p-8 md:rounded-2xl md:shadow-sm md:border md:border-gray-200 mx-auto">
        
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Supplier</label>
              <select name="supplierId" value={formData.supplierId} onChange={handleChange} className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f62fe] transition-all">
                <option value="">Select Supplier</option>
                <option value="1">Supplier A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f62fe] transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Expected Date</label>
              <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleChange} className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f62fe] transition-all text-gray-700" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">GST% (optional)</label>
              <input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange} className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f62fe] transition-all" />
            </div>
          </div>

          {/* Material Items Box */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Materials</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item</label>
                <select name="materialId" value={formData.materialId} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f62fe]">
                  <option value="">Select Material</option>
                  <option value="cement">Cement</option>
                </select>
              </div>
              <div className="flex-[1]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f62fe]" />
              </div>
            </div>
            
            <button type="button" className="w-full py-3.5 border-2 border-dashed border-[#0f62fe]/50 hover:border-[#0f62fe] rounded-xl text-[#0f62fe] font-semibold text-sm flex items-center justify-center gap-2 bg-blue-50/30 hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add another material
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Total Amount</label>
            <input type="text" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f62fe] transition-all font-bold text-lg" placeholder="₹ 0.00" />
          </div>

          <div className="pt-6">
            <button type="submit" className="w-full bg-[#0f62fe] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
              Send for Approval
            </button>
          </div>

        </form>
      </div>
    </PageContainer>
  );
};

export default CreatePOPage;