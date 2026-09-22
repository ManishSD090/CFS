// src/modules/inventory/pages/InventoryListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';
import MaterialFormModal from '../components/MaterialFormModal';
import EquipmentFormModal from '../components/EquipmentFormModal';
import { CardSkeleton } from '../../../shared/components/Skeletons';

const InventoryListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'materials';

  const [searchQuery,    setSearchQuery]    = useState('');
  const [materials,      setMaterials]      = useState([]);
  const [equipment,      setEquipment]      = useState([]);
  const [summary,        setSummary]        = useState({ materialCount: 0, materialValue: 0, equipmentCount: 0, equipmentValue: 0 });
  const [isLoading,      setIsLoading]      = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStock,    setFilterStock]    = useState('ALL');
  const [isFilterOpen,   setIsFilterOpen]   = useState(false);

  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isEqModalOpen,  setIsEqModalOpen]  = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matRes, eqRes] = await Promise.all([
        inventoryService.getAllMaterials(),
        inventoryService.getAllEquipment(),
      ]);

      if (matRes.success) {
        const mats = matRes.data || [];
        setMaterials(mats);
        const matValue = mats.reduce((sum, m) => sum + ((m.stockQuantity || 0) * (m.unitPrice || 0)), 0);
        setSummary(prev => ({ ...prev, materialCount: mats.length, materialValue: matValue }));
      }

      if (eqRes.success) {
        const eqs = eqRes.data || [];
        setEquipment(eqs);
        const eqValue = eqRes.summary?.totalValue || eqs.reduce((sum, e) => sum + (e.purchaseCost || 0), 0);
        setSummary(prev => ({ ...prev, equipmentCount: eqRes.summary?.totalEquipment || eqs.length, equipmentValue: eqValue }));
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setFilterCategory('ALL');
    setFilterStock('ALL');
    setSearchQuery('');
  };

  const openCreateModal = () => {
    activeTab === 'materials' ? setIsMatModalOpen(true) : setIsEqModalOpen(true);
  };

  // Filter logic
  let filteredMaterials = materials.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.materialCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filterCategory !== 'ALL') filteredMaterials = filteredMaterials.filter(m => m.category === filterCategory);
  if (filterStock === 'LOW')    filteredMaterials = filteredMaterials.filter(m => m.stockQuantity > 0 && m.stockQuantity <= (m.minimumStock || 0));
  if (filterStock === 'OUT')    filteredMaterials = filteredMaterials.filter(m => m.stockQuantity === 0 || m.stockQuantity == null);

  let filteredEquipment = equipment.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filterCategory !== 'ALL') filteredEquipment = filteredEquipment.filter(e => e.type === filterCategory);

  const hasActiveFilter = filterCategory !== 'ALL' || filterStock !== 'ALL';

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/inventory')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Global Inventory</h1>
            <p className="text-xs text-slate-400">Company-wide master inventory records</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create {activeTab === 'materials' ? 'Material' : 'Equipment'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl p-1 w-fit">
        {[{ id: 'materials', label: 'Materials' }, { id: 'equipments', label: 'Equipment' }].map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Summary Bar ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xl font-black text-brand-600">
              {activeTab === 'materials' ? summary.materialCount : summary.equipmentCount}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total {activeTab === 'materials' ? 'Materials' : 'Equipment'}</p>
          </div>
          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700" />
          <div>
            <p className="text-2xl font-black text-brand-600">
              ₹{(activeTab === 'materials' ? summary.materialValue : summary.equipmentValue).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Value</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin/inventory/history?tab=${activeTab}`)}
          className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          View History
        </button>
      </div>

      {/* ── Search + Filter Row ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search by name or code...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
          />
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              isFilterOpen || hasActiveFilter
                ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 text-brand-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            Filter
            {hasActiveFilter && <span className="w-2 h-2 bg-brand-600 rounded-full" />}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-12 w-60 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl p-4 z-50 animate-zoom-in">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                  >
                    <option value="ALL">All Categories</option>
                    {activeTab === 'materials' ? (
                      <>
                        <option value="Cement">Cement</option>
                        <option value="Steel">Steel</option>
                        <option value="Sand">Sand</option>
                        <option value="Bricks">Bricks</option>
                        <option value="Aggregates">Aggregates</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Raw Material">Raw Material</option>
                        <option value="Consumables">Consumables</option>
                      </>
                    ) : (
                      <>
                        <option value="Crane">Crane</option>
                        <option value="Excavator">Excavator</option>
                        <option value="Generator">Generator</option>
                        <option value="Concrete Mixer">Concrete Mixer</option>
                        <option value="Heavy Machinery">Heavy Machinery</option>
                      </>
                    )}
                  </select>
                </div>

                {activeTab === 'materials' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Status</label>
                    <select
                      value={filterStock}
                      onChange={e => setFilterStock(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                    >
                      <option value="ALL">All Status</option>
                      <option value="LOW">Low Stock</option>
                      <option value="OUT">Out of Stock</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={() => { setFilterCategory('ALL'); setFilterStock('ALL'); setIsFilterOpen(false); }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeTab === 'materials' ? (
            filteredMaterials.length > 0 ? filteredMaterials.map(mat => (
              <div
                key={mat.id}
                onClick={() => navigate(`/admin/inventory/item/material/${mat.id}`)}
                className="bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 uppercase tracking-wider">
                    {mat.category || 'General'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{mat.materialCode || '—'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition-colors mb-3">
                  {mat.name}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Stock</span>
                    <span className={`font-bold ${mat.stockQuantity <= (mat.minimumStock || 0) ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                      {mat.stockQuantity ?? 0} {mat.unit}
                      {mat.stockQuantity <= (mat.minimumStock || 0) && (
                        <span className="ml-1.5 text-[9px] bg-red-100 dark:bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded-full font-black">LOW</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Unit Price</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">₹{mat.unitPrice ?? 0}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full">
                <EmptyState label="No materials match your search or filters" />
              </div>
            )
          ) : (
            filteredEquipment.length > 0 ? filteredEquipment.map(eq => (
              <div
                key={eq.id}
                onClick={() => navigate(`/admin/inventory/item/equipment/${eq.id}`)}
                className="bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    eq.ownershipType === 'OWNED'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                      : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600'
                  }`}>
                    {eq.ownershipType || 'OWNED'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    eq.status === 'AVAILABLE'
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                      : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                  }`}>
                    {eq.status || 'AVAILABLE'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition-colors mb-1">
                  {eq.name}
                </h4>
                <p className="text-xs text-slate-400 mb-3">{eq.type}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Cost / Rate</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      ₹{eq.ownershipType === 'OWNED' ? eq.purchaseCost : eq.rentalRate}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Location</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {eq.location === 'PROJECT' ? 'On Site' : 'Warehouse'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full">
                <EmptyState label="No equipment match your search or filters" />
              </div>
            )
          )}
        </div>
      )}

      {/* Modals */}
      <MaterialFormModal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} onSuccess={fetchData} />
      <EquipmentFormModal isOpen={isEqModalOpen} onClose={() => setIsEqModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
};

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center">
      <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>
      </svg>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}

export default InventoryListPage;