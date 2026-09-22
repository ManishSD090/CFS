// src/shared/components/TransferModal.jsx
import React, { useState } from 'react';

const TransferModal = ({ isOpen, onClose, itemName, itemUnit }) => {
  const [transferData, setTransferData] = useState({
    toProject: '',
    quantity: '',
    remarks: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Transfer Item</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Item to Transfer</p>
            <p className="text-lg font-black text-[#0f62fe]">{itemName}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transfer to Project</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none"
                value={transferData.toProject}
                onChange={(e) => setTransferData({...transferData, toProject: e.target.value})}
              >
                <option value="">Select Target Project</option>
                <option value="p1">Metro Line Extension</option>
                <option value="p2">Central Bridge Site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity ({itemUnit})</label>
              <input 
                type="number"
                placeholder="0"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none"
                value={transferData.quantity}
                onChange={(e) => setTransferData({...transferData, quantity: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
              <textarea 
                rows="3"
                placeholder="Reason for transfer..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none resize-none"
                value={transferData.remarks}
                onChange={(e) => setTransferData({...transferData, remarks: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-3 bg-[#0f62fe] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Confirm Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;