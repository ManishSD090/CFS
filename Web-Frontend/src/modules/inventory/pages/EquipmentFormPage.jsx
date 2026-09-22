import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';

const EquipmentFormPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exact fields from Images 8 and 9
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ownershipType: 'Owned', // Owned or Rented
    purchaseCost: '',
    purchaseDate: '',
    vendor: '',
    rentPerDay: '',
    startDate: '',
    endDate: '',
    fuelType: '',
    fuelCostPerLitre: '',
    avgConsumptionPerDay: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // API Call goes here
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/inventory/list');
    }, 1000);
  };

  return (
    <PageContainer title="Create Equipment" showBack={true}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 mt-4">
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Equipment Name</label>
          <input required type="text" placeholder="Enter equipment name" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-gray-900 placeholder-blue-200" 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
          <select className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-blue-500"
            value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            <option value="">Select Category</option>
            <option value="Heavy Machinery">Heavy Machinery</option>
            <option value="Tools">Tools</option>
          </select>
        </div>

        {/* Ownership Radio Buttons */}
        <div className="flex gap-8 px-2 py-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ownershipType === 'Owned' ? 'border-[#0f62fe]' : 'border-gray-400'}`}>
              {formData.ownershipType === 'Owned' && <div className="w-2.5 h-2.5 bg-[#0f62fe] rounded-full"></div>}
            </div>
            <span className="font-bold text-gray-900">Owned</span>
            <input type="radio" className="hidden" name="ownershipType" value="Owned" checked={formData.ownershipType === 'Owned'} onChange={(e) => setFormData({...formData, ownershipType: e.target.value})} />
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ownershipType === 'Rented' ? 'border-[#0f62fe]' : 'border-gray-400'}`}>
              {formData.ownershipType === 'Rented' && <div className="w-2.5 h-2.5 bg-[#0f62fe] rounded-full"></div>}
            </div>
            <span className="font-bold text-gray-900">Rented</span>
            <input type="radio" className="hidden" name="ownershipType" value="Rented" checked={formData.ownershipType === 'Rented'} onChange={(e) => setFormData({...formData, ownershipType: e.target.value})} />
          </label>
        </div>

        {/* Dynamic Section based on Ownership */}
        <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50 space-y-6">
          {formData.ownershipType === 'Owned' ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Purchase Cost</label>
                <input type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
                  value={formData.purchaseCost} onChange={(e) => setFormData({...formData, purchaseCost: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Purchase Date</label>
                <input type="date" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-gray-500" 
                  value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Vendor</label>
                <select className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-blue-500"
                  value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})}>
                  <option value="">Select Vendor</option>
                  <option value="Vendor A">Vendor A</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Rent Per Day</label>
                <input type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
                  value={formData.rentPerDay} onChange={(e) => setFormData({...formData, rentPerDay: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Start date</label>
                  <input type="date" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-gray-500" 
                    value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">End date</label>
                  <input type="date" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-gray-500" 
                    value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fuel Section */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Fuel Type</label>
            <input type="text" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Fuel Cost per Litre</label>
            <input type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.fuelCostPerLitre} onChange={(e) => setFormData({...formData, fuelCostPerLitre: e.target.value})} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Avg Consumption Per Day</label>
          <input type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
            value={formData.avgConsumptionPerDay} onChange={(e) => setFormData({...formData, avgConsumptionPerDay: e.target.value})} />
        </div>

        <div className="pt-4 flex justify-center">
          <button type="submit" disabled={isSubmitting} className="w-full max-w-xs py-4 bg-[#0f62fe] text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 text-lg">
            {isSubmitting ? 'Saving...' : "Create Equipment"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

export default EquipmentFormPage;