// src/modules/inventory/components/EquipmentFormModal.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory.service';

const EquipmentFormModal = ({ isOpen, onClose, onSuccess, editId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '', type: '', code: '', ownershipType: 'OWNED',
    purchaseCost: '', purchaseDate: '', fuelType: '', fuelConsumption: '',
    rentalProvider: '', rentalRate: '', rentalUnit: 'DAY', startDate: '', endDate: '',
    fuelCostPerLitre: ''
  });

  useEffect(() => {
    setErrorMessage('');
    if (isOpen && editId) {
      inventoryService.getEquipmentById(editId).then(res => {
        if (res.success) setFormData(res.data);
      }).catch(() => setErrorMessage('Failed to load equipment data.'));
    } else if (isOpen) {
      setFormData({
        name: '', type: '', code: '', ownershipType: 'OWNED',
        purchaseCost: '', purchaseDate: '', fuelType: '', fuelConsumption: '',
        rentalProvider: '', rentalRate: '', rentalUnit: 'DAY', startDate: '', endDate: '',
        fuelCostPerLitre: ''
      });
    }
  }, [isOpen, editId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    let payload = {
      name: formData.name,
      type: formData.type || 'Heavy Machinery',
      ownershipType: formData.ownershipType,
    };

    if (formData.ownershipType === 'OWNED') {
      payload.purchaseCost = Number(formData.purchaseCost) || 0;
      if (formData.purchaseDate) payload.purchaseDate = new Date(formData.purchaseDate).toISOString();
      if (formData.fuelType) payload.fuelType = formData.fuelType.toUpperCase();
      payload.fuelConsumption = Number(formData.fuelConsumption) || 0;
    } else {
      payload.rentalProvider = formData.rentalProvider || undefined;
      payload.rentalRate = Number(formData.rentalRate) || 0;
      payload.rentalUnit = formData.rentalUnit;
    }

    try {
      if (editId) await inventoryService.updateEquipment(editId, payload);
      else await inventoryService.createEquipment(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save equipment. Check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Equipment' : 'Create Equipment'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800/50">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Equipment Name *</label>
              <input required type="text" placeholder="e.g. Concrete Mixer CM-450" className={field}
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <label className={label}>Equipment Category</label>
              <select className={field} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="">Select category</option>
                <option value="Crane">Crane</option>
                <option value="Excavator">Excavator</option>
                <option value="Generator">Generator</option>
                <option value="Concrete Mixer">Concrete Mixer</option>
                <option value="Compactor">Compactor</option>
                <option value="Bulldozer">Bulldozer</option>
                <option value="Truck">Truck</option>
                <option value="Scaffolding">Scaffolding</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Ownership Type Toggle */}
            <div>
              <label className={label}>Ownership Type</label>
              <div className="flex gap-3">
                {['OWNED', 'RENTED'].map(t => (
                  <label key={t} className="flex-1 cursor-pointer">
                    <input type="radio" name="ownershipType" value={t} checked={formData.ownershipType === t}
                      onChange={e => setFormData({ ...formData, ownershipType: e.target.value })} className="sr-only" />
                    <div className={`text-center py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${formData.ownershipType === t
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}>
                      {t === 'OWNED' ? '🏗️ Owned' : '📋 Rented'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Fields */}
            {formData.ownershipType === 'OWNED' ? (
              <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Purchase Cost (₹)</label>
                    <input type="number" min="0" placeholder="0" className={field}
                      value={formData.purchaseCost} onChange={e => setFormData({ ...formData, purchaseCost: e.target.value })} />
                  </div>
                  <div>
                    <label className={label}>Purchase Date</label>
                    <input type="date" className={field}
                      value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Fuel Type</label>
                    <select className={field} value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                      <option value="">None</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="PETROL">Petrol</option>
                      <option value="ELECTRIC">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Avg Consumption/Day</label>
                    <input type="number" min="0" placeholder="Litres" className={field}
                      value={formData.fuelConsumption} onChange={e => setFormData({ ...formData, fuelConsumption: e.target.value })} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                <div>
                  <label className={label}>Rental Provider</label>
                  <input type="text" placeholder="e.g. Atlas Machinery Rentals" className={field}
                    value={formData.rentalProvider} onChange={e => setFormData({ ...formData, rentalProvider: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Rental Rate (₹)</label>
                    <input type="number" min="0" placeholder="0" className={field}
                      value={formData.rentalRate} onChange={e => setFormData({ ...formData, rentalRate: e.target.value })} />
                  </div>
                  <div>
                    <label className={label}>Per</label>
                    <select className={field} value={formData.rentalUnit} onChange={e => setFormData({ ...formData, rentalUnit: e.target.value })}>
                      <option value="DAY">Day</option>
                      <option value="HOUR">Hour</option>
                      <option value="MONTH">Month</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Saving...' : (editId ? 'Update Equipment' : 'Create Equipment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFormModal;