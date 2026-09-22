import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';
import PageContainer from '../../../shared/components/PageContainer';

const MaterialFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Exact fields from Image 7
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    hsnCode: '',
    minimumStock: '',
    unitPrice: '',
    taxPercent: '',
    supplier: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      inventoryService.getMaterialById(id).then(res => {
        if (res.success) setFormData(res.data);
      });
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) await inventoryService.updateMaterial(id, formData);
      else await inventoryService.createMaterial(formData);
      navigate('/inventory/list');
    } catch (err) {
      alert("Failed to save material.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title={isEditMode ? "Edit Material" : "Create Material"} showBack={true}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 mt-4">
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Material Name</label>
          <input required type="text" placeholder="Enter the material name" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-gray-900 placeholder-blue-200" 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
          <select className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-blue-500"
            value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            <option value="">Select Category</option>
            <option value="Cement">Cement</option>
            <option value="Steel">Steel</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">HSN Code</label>
            <input type="text" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.hsnCode} onChange={(e) => setFormData({...formData, hsnCode: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Low Stock Threshold</label>
            <input required type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.minimumStock} onChange={(e) => setFormData({...formData, minimumStock: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Cost per Unit</label>
            <input required type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Tax %</label>
            <input type="number" className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none" 
              value={formData.taxPercent} onChange={(e) => setFormData({...formData, taxPercent: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Supplier Name</label>
          <select className="w-full p-4 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none text-blue-500"
            value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})}>
            <option value="">Select Supplier</option>
            <option value="Supplier A">Supplier A</option>
          </select>
        </div>

        <div className="pt-4 flex justify-center">
          <button type="submit" disabled={isSubmitting} className="w-full max-w-xs py-4 bg-[#0f62fe] text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 text-lg">
            {isSubmitting ? 'Saving...' : (isEditMode ? "Update Material" : "Create Material")}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

export default MaterialFormPage;