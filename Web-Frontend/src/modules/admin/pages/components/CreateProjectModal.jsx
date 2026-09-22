import { useState, useEffect } from 'react';
import apiClient from '../../../../api/apiClient';

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    clientId: '',
    description: '',
    startDate: '',
    estimatedEndDate: '',
    estimatedBudget: '',
    advanceReceived: '',
    contractValue: '',
    geofenceRadius: '',
    managerId: '',
    priority: 'MEDIUM',
  });
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees with 'Project Manager' role for the project manager dropdown
  useEffect(() => {
    if (!isOpen) return;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        // Fetch a large page to get all employees, then filter by role name
        const res = await apiClient.get('/users', { params: { limit: 200 } });
        const list = res.data?.data || res.data || [];
        // Keep only users whose role name is exactly 'Project Manager'
        const managers = list.filter(
          (emp) => emp.role?.name?.toLowerCase() === 'project manager'
        );
        setEmployees(managers);
      } catch (err) {
        console.error('Failed to fetch employees for manager dropdown:', err);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Please enter a project name to continue.');
      return;
    }
    if (!formData.projectId.trim()) {
      setError('Please enter a project ID (e.g. PRJ-001).');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required.');
      return;
    }
    if (!formData.estimatedEndDate) {
      setError('Estimated end date is required.');
      return;
    }
    if (!formData.estimatedBudget) {
      setError('Estimated budget is required.');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Latitude and Longitude are required for project site location.');
      return;
    }
    setError('');

    // Build payload matching the backend createProjectSchema exactly
    const payload = {
      projectId: formData.projectId.trim(),
      name: formData.name.trim(),
      description: formData.description || undefined,
      location: formData.location || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
      geofenceRadius: formData.geofenceRadius || undefined,
      estimatedBudget: formData.estimatedBudget,
      contractValue: formData.contractValue || undefined,
      advanceReceived: formData.advanceReceived || undefined,
      clientId: formData.clientId || undefined,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      priority: formData.priority || 'MEDIUM',
    };

    // Reset form
    setFormData({
      projectId: '', name: '', location: '', latitude: '', longitude: '',
      clientId: '', description: '', startDate: '', estimatedEndDate: '',
      estimatedBudget: '', advanceReceived: '', contractValue: '',
      geofenceRadius: '', managerId: '', priority: 'MEDIUM',
    });
    onCreate(payload);
  };

  const inputClass = "field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create new project</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 md:px-6 py-5 space-y-5">

          {/* ─── Section: Project Details ─── */}
          <SectionHeader icon="box" label="Project details" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Project name <span className="text-red-500">*</span></label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="e.g. Highway Bridge Phase 1" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Project ID <span className="text-red-500">*</span></label>
              <input name="projectId" value={formData.projectId} onChange={handleChange} type="text" placeholder="e.g. PRJ-001" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Enter project description..." className={`${inputClass} resize-none`}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Project Manager</label>
              <select name="managerId" value={formData.managerId} onChange={handleChange} className={inputClass}>
                <option value="">{loadingEmployees ? 'Loading...' : 'Select manager'}</option>
                {employees.length === 0 && !loadingEmployees && (
                  <option disabled value="">No Project Managers found</option>
                )}
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}{emp.designation ? ` — ${emp.designation}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Section: Location ─── */}
          <SectionHeader icon="pin" label="Location & Site" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <label className={labelClass}>Location name</label>
              <input name="location" value={formData.location} onChange={handleChange} type="text" placeholder="e.g. Mumbai, MH" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Latitude <span className="text-red-500">*</span></label>
              <input name="latitude" value={formData.latitude} onChange={handleChange} type="number" step="any" placeholder="e.g. 19.0760" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Longitude <span className="text-red-500">*</span></label>
              <input name="longitude" value={formData.longitude} onChange={handleChange} type="number" step="any" placeholder="e.g. 72.8777" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <label className={labelClass}>Geofence radius (metres)</label>
            <input name="geofenceRadius" value={formData.geofenceRadius} onChange={handleChange} type="number" placeholder="Default: 200" className={inputClass} />
          </div>

          {/* ─── Section: Dates ─── */}
          <SectionHeader icon="calendar" label="Timeline" />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Start date <span className="text-red-500">*</span></label>
              <input name="startDate" value={formData.startDate} onChange={handleChange} type="date" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Est. end date <span className="text-red-500">*</span></label>
              <input name="estimatedEndDate" value={formData.estimatedEndDate} onChange={handleChange} type="date" className={inputClass} />
            </div>
          </div>

          {/* ─── Section: Financials ─── */}
          <SectionHeader icon="rupee" label="Financials" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Est. budget (₹) <span className="text-red-500">*</span></label>
              <input name="estimatedBudget" value={formData.estimatedBudget} onChange={handleChange} type="number" placeholder="e.g. 5000000" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Contract value (₹)</label>
              <input name="contractValue" value={formData.contractValue} onChange={handleChange} type="number" placeholder="e.g. 4500000" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Advance received (₹)</label>
              <input name="advanceReceived" value={formData.advanceReceived} onChange={handleChange} type="number" placeholder="e.g. 500000" className={inputClass} />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors shadow-sm">Create Project</button>
        </div>
      </div>
    </div>
  );
}

// Small helper for section headers
function SectionHeader({ icon, label }) {
  const icons = {
    box: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    rupee: <><line x1="6" y1="4" x2="18" y2="4"/><line x1="6" y1="9" x2="18" y2="9"/><path d="M6 14l6 6 6-6M12 20V9"/></>,
  };
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
      </svg>
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}
