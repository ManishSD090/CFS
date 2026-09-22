// src/modules/inventory/pages/ItemDetailsPage.jsx
// Dual-mode: handles both Material and Equipment details
// Route: /admin/inventory/item?type=material|equipment&id=xxx&name=yyy
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';

const fmtCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

const FUEL_TYPES = ['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG', 'OTHER'];
const EQ_STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED'];
const URGENCY_OPTS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const QUALITY_OPTS = ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'REJECT'];

function Field({ label, value }) {
  return (
    <div className="flex py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value || 'N/A'}</span>
    </div>
  );
}

export default function ItemDetailsPage() {
  const navigate = useNavigate();
  const { type, id: itemId } = useParams();
  const [searchParams] = useSearchParams();
  const itemName = searchParams.get('name') || 'Item Details';
  const isMaterial = type === 'material';

  const [item, setItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'edit' | 'addStock' | 'request' | 'transfer' | 'assign'
  const [isSaving, setIsSaving] = useState(false);

  // --- Form state for modals ---
  // Edit Material
  const [editMat, setEditMat] = useState({});
  // Edit Equipment
  const [editEq, setEditEq] = useState({});
  // Add Stock
  const [addStock, setAddStock] = useState({ quantity: '', unitPrice: '', batchNumber: '', notes: '', purchaseDate: '', expiryDate: '' });
  // Request Material
  const [reqForm, setReqForm] = useState({ projectId: '', quantity: '', urgency: 'MEDIUM', purpose: '', supplier: '', expectedDelivery: '' });
  // Transfer
  const [transferForm, setTransferForm] = useState({ toProject: true, toProjectId: '', quantity: '', description: '', transferDate: '' });
  // Assign Equipment
  const [assignForm, setAssignForm] = useState({ projectId: '', assignedRate: '', assignedFuelCost: '' });

  useEffect(() => {
    if (!itemId) { navigate(-1); return; }
    Promise.all([
      isMaterial ? inventoryService.getMaterialById(itemId) : inventoryService.getEquipmentById(itemId),
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      }).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([itemRes, projRes]) => {
      const d = itemRes.data || itemRes;
      setItem(d);
      if (isMaterial) setEditMat({ name: d.name || '', materialCode: d.materialCode || '', unit: d.unit || '', unitPrice: d.unitPrice || '', minimumStock: d.minimumStock || '', supplier: d.supplier || '', supplierContact: d.supplierContact || '' });
      else setEditEq({ name: d.name || '', code: d.code || '', type: d.type || '', model: d.model || '', manufacturer: d.manufacturer || '', year: d.year || '', serialNumber: d.serialNumber || '', registrationNumber: d.registrationNumber || '', condition: d.condition || '', status: d.status || 'AVAILABLE', ownershipType: d.ownershipType || 'OWNED', fuelType: d.fuelType || 'DIESEL', fuelConsumption: d.fuelConsumption || '', rentalProvider: d.rentalProvider || '', rentalRate: d.rentalRate || '', purchaseCost: d.purchaseCost || '', lastServiceDate: d.lastServiceDate ? d.lastServiceDate.split('T')[0] : '', nextServiceDate: d.nextServiceDate ? d.nextServiceDate.split('T')[0] : '', purchaseDate: d.purchaseDate ? d.purchaseDate.split('T')[0] : '' });
      const projs = Array.isArray(projRes.data) ? projRes.data : (Array.isArray(projRes) ? projRes : []);
      setProjects(projs);
    }).catch(e => { console.error(e); alert('Failed to load item: ' + e.message); navigate(-1); })
      .finally(() => setIsLoading(false));
  }, [itemId, isMaterial, navigate]);

  const closeModal = () => setActiveModal(null);

  // --- Handlers ---
  const handleEditMaterial = async () => {
    setIsSaving(true);
    try {
      await inventoryService.updateMaterial(itemId, { ...editMat, unitPrice: parseFloat(editMat.unitPrice) || 0, minimumStock: parseFloat(editMat.minimumStock) || 0 });
      const res = await inventoryService.getMaterialById(itemId);
      setItem(res.data || res);
      closeModal();
    } catch (e) { alert('Update failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleEditEquipment = async () => {
    setIsSaving(true);
    try {
      const payload = { ...editEq, year: parseInt(editEq.year) || undefined, fuelConsumption: parseFloat(editEq.fuelConsumption) || undefined, rentalRate: parseFloat(editEq.rentalRate) || undefined, purchaseCost: parseFloat(editEq.purchaseCost) || undefined };
      if (!payload.fuelConsumption) delete payload.fuelConsumption;
      if (!payload.rentalRate) delete payload.rentalRate;
      if (!payload.purchaseCost) delete payload.purchaseCost;
      if (!payload.year) delete payload.year;
      await inventoryService.updateEquipment(itemId, payload);
      const res = await inventoryService.getEquipmentById(itemId);
      setItem(res.data || res);
      closeModal();
    } catch (e) { alert('Update failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleAddStock = async () => {
    if (!parseFloat(addStock.quantity) > 0) return alert('Enter valid quantity');
    setIsSaving(true);
    try {
      const payload = { materialId: itemId, quantity: parseFloat(addStock.quantity), unitPrice: parseFloat(addStock.unitPrice) || 0, notes: addStock.notes };
      if (isMaterial) { payload.batchNumber = addStock.batchNumber; if (addStock.purchaseDate) payload.purchaseDate = addStock.purchaseDate; if (addStock.expiryDate) payload.expiryDate = addStock.expiryDate; }
      await inventoryService.addOpeningStock(payload);
      const res = isMaterial ? await inventoryService.getMaterialById(itemId) : await inventoryService.getEquipmentById(itemId);
      setItem(res.data || res);
      closeModal();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleRequest = async () => {
    if (!reqForm.projectId) return alert('Select a project');
    if (!parseFloat(reqForm.quantity) > 0) return alert('Enter valid quantity');
    if (!reqForm.purpose) return alert('Purpose is required');
    setIsSaving(true);
    try {
      const payload = { projectId: reqForm.projectId, materialId: itemId, materialName: item?.name || itemName, quantity: parseFloat(reqForm.quantity), unit: item?.unit || '', purpose: reqForm.purpose, urgency: reqForm.urgency };
      if (reqForm.supplier) payload.supplier = reqForm.supplier;
      if (reqForm.expectedDelivery) payload.expectedDelivery = reqForm.expectedDelivery;
      await inventoryService.requestItem(payload);
      closeModal();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleTransfer = async () => {
    setIsSaving(true);
    try {
      const payload = { fromLocation: 'GLOBAL', toLocation: transferForm.toProject ? 'PROJECT' : 'GLOBAL', description: transferForm.description };
      if (transferForm.toProject) payload.toProjectId = transferForm.toProjectId;
      if (transferForm.transferDate) payload.transferDate = transferForm.transferDate;
      payload.items = [{ itemType: isMaterial ? 'MATERIAL' : 'EQUIPMENT', ...(isMaterial ? { materialId: itemId, quantity: parseFloat(transferForm.quantity) || 0 } : { equipmentId: itemId }) }];
      await inventoryService.transferItem(payload);
      closeModal();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.projectId) return alert('Select destination project');
    setIsSaving(true);
    try {
      await inventoryService.assignEquipment(itemId, { projectId: assignForm.projectId, assignedRate: parseFloat(assignForm.assignedRate) || 0, assignedFuelCost: parseFloat(assignForm.assignedFuelCost) || 0 });
      const res = await inventoryService.getEquipmentById(itemId);
      setItem(res.data || res);
      closeModal();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleRelease = async () => {
    if (!window.confirm('Release this equipment back to Global Inventory?')) return;
    setIsSaving(true);
    try {
      await inventoryService.releaseEquipment(itemId);
      const res = await inventoryService.getEquipmentById(itemId);
      setItem(res.data || res);
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-[#0D6EFD]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
    </div>
  );
  if (!item) return null;

  const eqStatus = item.status || 'AVAILABLE';
  const eqOwnership = item.ownershipType || 'OWNED';
  const isGlobal = !item.projectId; // equipment not assigned

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28">
      {/* Header */}
      <div className="bg-[#0D6EFD] sticky top-0 z-10 flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-white text-[17px] font-bold">{item.name || itemName}</h1>
          <p className="text-blue-200 text-xs">{isMaterial ? 'Material Details' : 'Equipment Details'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Info Card ──────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">{isMaterial ? 'Material Info' : 'Equipment Info'}</h3>
            <button onClick={() => setActiveModal('edit')} className="p-2 bg-blue-50 rounded-full hover:bg-blue-100">
              <svg className="w-4 h-4 text-[#0D6EFD]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
          <Field label="Name" value={item.name} />
          {isMaterial ? (
            <>
              <Field label="Code" value={item.materialCode} />
              <Field label="Unit" value={item.unit} />
              <Field label="Cost per Unit" value={fmtCurrency(item.unitPrice)} />
              <Field label="Total Quantity" value={`${item.stockQuantity || 0} ${item.unit || ''}`} />
              <Field label="Low Stock Threshold" value={`${item.minimumStock || 0} ${item.unit || ''}`} />
            </>
          ) : (
            <>
              <Field label="Code / Tag" value={item.code} />
              <Field label="Type" value={item.type} />
              <Field label="Model" value={item.model} />
              <Field label="Manufacturer" value={item.manufacturer} />
              <Field label="Year" value={item.year?.toString()} />
              <Field label="Serial Number" value={item.serialNumber} />
              <Field label="Registration No." value={item.registrationNumber} />
              <Field label="Status" value={eqStatus} />
              <Field label="Condition" value={item.condition} />
              <Field label="Ownership" value={eqOwnership} />
              <Field label={eqOwnership === 'RENTED' ? 'Rent/Day' : 'Purchase Cost'} value={fmtCurrency(eqOwnership === 'RENTED' ? item.rentalRate : item.purchaseCost)} />
              {item.fuelType && <Field label="Fuel Type" value={item.fuelType} />}
              <Field label="Last Service" value={fmtDate(item.lastServiceDate)} />
              <Field label="Next Service" value={fmtDate(item.nextServiceDate)} />
            </>
          )}
        </div>

        {/* ── Vendor Card ──────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Vendor Info</h3>
            <button onClick={() => setActiveModal('edit')} className="p-2 bg-blue-50 rounded-full hover:bg-blue-100">
              <svg className="w-4 h-4 text-[#0D6EFD]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
          <Field label="Vendor Name" value={isMaterial ? item.supplier : (item.rentalProvider || item.manufacturer)} />
          {isMaterial && <Field label="Contact Info" value={item.supplierContact} />}
        </div>
      </div>

      {/* ── Bottom Action Bar ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3 md:left-64">
        {isMaterial ? (
          <>
            <button onClick={() => setActiveModal('addStock')} className="flex-1 py-3.5 bg-[#00B48A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-green-600">Add Stock</button>
            <button onClick={() => setActiveModal('request')} className="flex-1 py-3.5 bg-white border-2 border-[#0D6EFD] text-[#0D6EFD] font-bold rounded-xl text-sm hover:bg-blue-50">Request</button>
            <button onClick={() => setActiveModal('transfer')} className="flex-1 py-3.5 bg-[#0D6EFD] text-white font-bold rounded-xl text-sm shadow-md hover:bg-blue-700">Transfer</button>
          </>
        ) : (
          <>
            {isGlobal ? (
              <button onClick={() => setActiveModal('assign')} disabled={isSaving} className="flex-1 py-3.5 bg-[#00B48A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-green-600 disabled:opacity-50">Assign to Project</button>
            ) : (
              <button onClick={handleRelease} disabled={isSaving} className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-orange-600 disabled:opacity-50">{isSaving ? 'Processing...' : 'Release Equipment'}</button>
            )}
          </>
        )}
      </div>

      {/* ═══════════════ MODALS ═══════════════ */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Edit Material Modal */}
            {activeModal === 'edit' && isMaterial && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Edit Material</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                {[['Name *', 'name'], ['Material Code', 'materialCode'], ['Unit *', 'unit'], ['Unit Price (₹)', 'unitPrice', 'number'], ['Min Stock', 'minimumStock', 'number'], ['Supplier', 'supplier'], ['Supplier Contact', 'supplierContact']].map(([lbl, key, typ]) => (
                  <div key={key} className="mb-3">
                    <label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label>
                    <input type={typ || 'text'} value={editMat[key] || ''} onChange={e => setEditMat(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                ))}
                <button onClick={handleEditMaterial} disabled={isSaving} className="w-full py-3 bg-[#0D6EFD] text-white font-bold rounded-xl mt-2 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            )}

            {/* Edit Equipment Modal */}
            {activeModal === 'edit' && !isMaterial && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Edit Equipment</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="space-y-3">
                  {[['Name *', 'name'], ['Code / Tag', 'code'], ['Type *', 'type'], ['Model', 'model'], ['Manufacturer', 'manufacturer'], ['Year', 'year', 'number'], ['Serial Number', 'serialNumber'], ['Reg. Number', 'registrationNumber'], ['Condition', 'condition']].map(([lbl, key, typ]) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label>
                      <input type={typ || 'text'} value={editEq[key] || ''} onChange={e => setEditEq(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" />
                    </div>
                  ))}
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Status</label>
                    <select value={editEq.status || 'AVAILABLE'} onChange={e => setEditEq(p => ({ ...p, status: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                      {EQ_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Fuel Type</label>
                    <select value={editEq.fuelType || 'DIESEL'} onChange={e => setEditEq(p => ({ ...p, fuelType: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                      {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Fuel Consumption (L/Hr)</label>
                    <input type="number" step="0.1" value={editEq.fuelConsumption || ''} onChange={e => setEditEq(p => ({ ...p, fuelConsumption: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" />
                  </div>
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Ownership Type</label>
                    <select value={editEq.ownershipType || 'OWNED'} onChange={e => setEditEq(p => ({ ...p, ownershipType: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                      <option>OWNED</option><option>RENTED</option>
                    </select>
                  </div>
                  {editEq.ownershipType === 'RENTED' ? (
                    <><div><label className="text-xs font-bold text-gray-600 block mb-1">Rental Provider</label><input value={editEq.rentalProvider || ''} onChange={e => setEditEq(p => ({ ...p, rentalProvider: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-600 block mb-1">Rental Rate (₹/day)</label><input type="number" value={editEq.rentalRate || ''} onChange={e => setEditEq(p => ({ ...p, rentalRate: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div></>
                  ) : (
                    <><div><label className="text-xs font-bold text-gray-600 block mb-1">Purchase Cost (₹)</label><input type="number" value={editEq.purchaseCost || ''} onChange={e => setEditEq(p => ({ ...p, purchaseCost: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-600 block mb-1">Purchase Date</label><input type="date" value={editEq.purchaseDate || ''} onChange={e => setEditEq(p => ({ ...p, purchaseDate: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div></>
                  )}
                  {[['Last Service Date', 'lastServiceDate'], ['Next Service Date', 'nextServiceDate']].map(([lbl, key]) => (
                    <div key={key}><label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label><input type="date" value={editEq[key] || ''} onChange={e => setEditEq(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                  ))}
                </div>
                <button onClick={handleEditEquipment} disabled={isSaving} className="w-full py-3 bg-[#0D6EFD] text-white font-bold rounded-xl mt-4 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            )}

            {/* Add Stock Modal */}
            {activeModal === 'addStock' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Add Stock</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                {[['Quantity to Add *', 'quantity', 'number'], ['Unit Price (₹)', 'unitPrice', 'number'], ['Batch Number', 'batchNumber'], ['Notes', 'notes']].map(([lbl, key, typ]) => (
                  <div key={key} className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label>
                    <input type={typ || 'text'} value={addStock[key] || ''} onChange={e => setAddStock(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" />
                  </div>
                ))}
                {isMaterial && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[['Purchase Date', 'purchaseDate'], ['Expiry Date', 'expiryDate']].map(([lbl, key]) => (
                      <div key={key}><label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label><input type="date" value={addStock[key] || ''} onChange={e => setAddStock(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                    ))}
                  </div>
                )}
                <button onClick={handleAddStock} disabled={isSaving} className="w-full py-3 bg-[#00B48A] text-white font-bold rounded-xl disabled:opacity-50">{isSaving ? 'Adding...' : 'Submit Stock'}</button>
              </div>
            )}

            {/* Request Material Modal */}
            {activeModal === 'request' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Request Material</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Project *</label>
                  <select value={reqForm.projectId} onChange={e => setReqForm(p => ({ ...p, projectId: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Quantity *</label><input type="number" value={reqForm.quantity} onChange={e => setReqForm(p => ({ ...p, quantity: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Urgency</label>
                    <select value={reqForm.urgency} onChange={e => setReqForm(p => ({ ...p, urgency: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                      {URGENCY_OPTS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                {[['Purpose *', 'purpose'], ['Preferred Vendor (Optional)', 'supplier']].map(([lbl, key]) => (
                  <div key={key} className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">{lbl}</label><input value={reqForm[key] || ''} onChange={e => setReqForm(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                ))}
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Required By Date</label><input type="date" value={reqForm.expectedDelivery} onChange={e => setReqForm(p => ({ ...p, expectedDelivery: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                <button onClick={handleRequest} disabled={isSaving} className="w-full py-3 bg-[#00B48A] text-white font-bold rounded-xl disabled:opacity-50">{isSaving ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            )}

            {/* Transfer Modal */}
            {activeModal === 'transfer' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Transfer {isMaterial ? 'Material' : 'Equipment'}</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-2">Transfer To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={transferForm.toProject} onChange={() => setTransferForm(p => ({ ...p, toProject: true }))} className="accent-[#0D6EFD]" /><span className="text-sm">Project</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!transferForm.toProject} onChange={() => setTransferForm(p => ({ ...p, toProject: false }))} className="accent-[#0D6EFD]" /><span className="text-sm">Global</span></label>
                  </div>
                </div>
                {transferForm.toProject && (
                  <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Destination Project *</label>
                    <select value={transferForm.toProjectId} onChange={e => setTransferForm(p => ({ ...p, toProjectId: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                {isMaterial && (
                  <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Quantity to Transfer *</label><input type="number" value={transferForm.quantity} onChange={e => setTransferForm(p => ({ ...p, quantity: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                )}
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Transfer Date</label><input type="date" value={transferForm.transferDate} onChange={e => setTransferForm(p => ({ ...p, transferDate: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Description / Notes</label><input value={transferForm.description} onChange={e => setTransferForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                <button onClick={handleTransfer} disabled={isSaving} className="w-full py-3 bg-[#0D6EFD] text-white font-bold rounded-xl disabled:opacity-50">{isSaving ? 'Transferring...' : 'Initiate Transfer'}</button>
              </div>
            )}

            {/* Assign Equipment Modal */}
            {activeModal === 'assign' && !isMaterial && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Assign Equipment</h3><button onClick={closeModal}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="mb-3"><label className="text-xs font-bold text-gray-600 block mb-1">Destination Project *</label>
                  <select value={assignForm.projectId} onChange={e => setAssignForm(p => ({ ...p, projectId: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Assigned Rate (₹)</label><input type="number" value={assignForm.assignedRate} onChange={e => setAssignForm(p => ({ ...p, assignedRate: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-600 block mb-1">Fuel Cost (₹)</label><input type="number" value={assignForm.assignedFuelCost} onChange={e => setAssignForm(p => ({ ...p, assignedFuelCost: e.target.value }))} className="w-full border border-[#0D6EFD] rounded-lg px-3 py-2.5 text-sm outline-none" /></div>
                </div>
                <button onClick={handleAssign} disabled={isSaving} className="w-full py-3 bg-[#00B48A] text-white font-bold rounded-xl disabled:opacity-50">{isSaving ? 'Assigning...' : 'Assign to Project'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
