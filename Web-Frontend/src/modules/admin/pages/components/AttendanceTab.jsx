import { useState, useMemo } from 'react';
import PayrollDetailsModal from './PayrollDetailsModal';
import PayrollSettingsModal from './PayrollSettingsModal';
import ManageWorkersModal from './ManageWorkersModal';
import PersonDetailModal from './PersonDetailModal';
import CreatePersonModal from './CreatePersonModal';

const attStatusConfig = {
  Present:   { cls: 'bg-green-50 dark:bg-green-900/20 text-green-600',   label: 'Present'    },
  Absent:    { cls: 'bg-red-50 dark:bg-red-900/20 text-red-500',      label: 'Absent'     },
  'Week off': { cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',   label: 'Week off'   },
  'Paid Leave': { cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', label: 'Paid Leave' },
};

const attStatuses = Object.keys(attStatusConfig);
const shifts = ['1.0', '0.75', '0.5'];

// Mock data
const mockWorkers = [
  { id: 1, name: 'Ramesh Kumar', role: 'Mason',     rate: 600, shift: '1.0', status: 'Present',   checkin: '09:05 AM', checkout: '06:20 PM' },
  { id: 2, name: 'Suresh Patil', role: 'Carpenter', rate: 600, shift: '1.0', status: 'Week off',  checkin: '',         checkout: '' },
  { id: 3, name: 'Mahesh Yadav', role: 'Plumber',   rate: 600, shift: '1.0', status: 'Paid Leave', checkin: '',         checkout: '' },
  { id: 4, name: 'Dinesh Singh', role: 'Helper',    rate: 0,   shift: '1.0', status: 'Absent',    checkin: '',         checkout: '' },
  { id: 5, name: 'Ankit Sharma', role: 'Electrician', rate: 600, shift: '1.0', status: 'Present',   checkin: '08:30 AM', checkout: '05:30 PM' },
  { id: 6, name: 'Vijay Rao',    role: 'Mason',     rate: 600, shift: '0.75', status: 'Present',   checkin: '09:00 AM', checkout: '03:00 PM' },
];

const mockStaff = [
  { id: 1, name: 'Suresh Patil',  role: 'Site Engineer',    salary: 21600, status: 'Present',    checkin: '09:05 AM', checkout: '06:20 PM', shift: '1.0' },
  { id: 2, name: 'Anita Desai',   role: 'Site Engineer',    salary: 21600, status: 'Paid Leave', checkin: '',         checkout: '', shift: '1.0' },
  { id: 3, name: 'Vijay Nair',    role: 'Site Engineer',    salary: 21600, status: 'Absent',     checkin: '',         checkout: '', shift: '1.0' },
];

export default function AttendanceTab({ projectId }) {
  const [attMode, setAttMode] = useState('workers'); // 'workers' | 'staff'
  const [selectedDate, setSelectedDate] = useState('2026-02-20');
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState(mockWorkers);
  const [staff, setStaff] = useState(mockStaff);

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showPayrollSettingsModal, setShowPayrollSettingsModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showPersonDetailModal, setShowPersonDetailModal] = useState(false);
  const [showCreatePersonModal, setShowCreatePersonModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const currentList = useMemo(() => {
    const list = attMode === 'workers' ? workers : staff;
    if (!searchTerm) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attMode, workers, staff, searchTerm]);

  const presentCount = useMemo(() => {
    return currentList.filter(p => p.status === 'Present').length;
  }, [currentList]);

  const handleStatusChange = (id, newStatus) => {
    const updater = attMode === 'workers' ? setWorkers : setStaff;
    updater(prev => prev.map(p => {
      if (p.id === id) {
        let update = { status: newStatus };
        if (newStatus === 'Present') {
          update.checkin = '09:00 AM';
          update.checkout = '06:00 PM';
        } else {
          update.checkin = '';
          update.checkout = '';
        }
        return { ...p, ...update };
      }
      return p;
    }));
  };

  const handleShiftChange = (id, newShift) => {
    const updater = attMode === 'workers' ? setWorkers : setStaff;
    updater(prev => prev.map(p => p.id === id ? { ...p, shift: newShift } : p));
  };

  return (
    <div className="space-y-4">
      {/* ── Row 1: Summary cards + Donut + Payroll ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Labour / Staff counts */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Labors</span>
            <span className="text-2xl font-bold text-brand-600">50</span>
          </div>
          <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Staff</span>
            <span className="text-2xl font-bold text-brand-600">26</span>
          </div>
        </div>

        {/* Donut chart */}
        <div className="flex items-center justify-center p-2">
          <div className="relative">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="52" fill="none" stroke="#e2e8f0" strokeWidth="14" className="dark:stroke-slate-700" />
              {/* Labours Segment (Green) */}
              <circle cx="65" cy="65" r="52" fill="none" stroke="#22c55e" strokeWidth="14"
                strokeDasharray="200 127" strokeLinecap="round" transform="rotate(-90 65 65)"/>
              {/* Staff Segment (Blue) */}
              <circle cx="65" cy="65" r="52" fill="none" stroke="#2563eb" strokeWidth="14"
                strokeDasharray="127 200" strokeDashoffset="-200" strokeLinecap="round" transform="rotate(-90 65 65)"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">76</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center leading-tight">Total<br />Workforce</span>
            </div>
          </div>
        </div>

        {/* Overall Payroll */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Overall Payroll</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">₹21,600</p>
            </div>
            <button
              onClick={() => setShowPayrollModal(true)}
              className="flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              View Payroll
            </button>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Labours: <span className="font-semibold text-brand-600">₹10,600</span></p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Staff: <span className="font-semibold text-brand-600">₹11,000</span></p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Workers / Staff toggle + totals ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          <button
            onClick={() => setAttMode('workers')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${attMode === 'workers' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Workers
          </button>
          <button
            onClick={() => setAttMode('staff')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${attMode === 'staff' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Staff
          </button>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
          <span className="flex items-center gap-1.5">Total Payroll: <span className="font-bold text-brand-600">₹5,600</span></span>
          <span className="flex items-center gap-1.5">Labours: <span className="font-semibold text-slate-700 dark:text-slate-200">50</span></span>
          <span className="flex items-center gap-1.5">Staff: <span className="font-semibold text-slate-700 dark:text-slate-200">26</span></span>
        </div>
      </div>

      {/* ── Row 3: Date picker + Filter + Manage button ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        
        {/* Search inside Attendance */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={`Search ${attMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
          <button
            onClick={() => setShowManageModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Manage {attMode === 'workers' ? 'Workers' : 'Staff'}
          </button>
        </div>
      </div>

      {/* Present count */}
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
        {presentCount}/{currentList.length} Present
      </p>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-left">
                <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-5 py-4">Name & Role</th>
                <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-4 text-center">Check-in / Out</th>
                <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-4 text-center">Daily Pay</th>
                <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-4 text-center">Shift</th>
                <th className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-5 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {currentList.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-100 leading-none">{person.name}</p>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1.5">{person.role}</p>
                  </td>
                  <td className="px-3 py-4 text-center">
                    {person.status === 'Present' && person.checkin ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                          IN: {person.checkin}
                        </p>
                        <br />
                        <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                          OUT: {person.checkout || '—'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 dark:text-slate-600 font-medium">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center font-bold text-sm text-slate-700 dark:text-slate-200">
                    {person.status === 'Present' ? `₹${attMode === 'workers' ? person.rate : Math.round(person.salary / 30)}` : person.status === 'Absent' ? '₹0' : `₹${attMode === 'workers' ? person.rate : Math.round(person.salary / 30)}`}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <select
                      value={person.shift}
                      onChange={(e) => handleShiftChange(person.id, e.target.value)}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-center cursor-pointer min-w-[55px]"
                    >
                      {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select
                      value={person.status}
                      onChange={(e) => handleStatusChange(person.id, e.target.value)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer appearance-none text-center min-w-[100px] ${attStatusConfig[person.status]?.cls || ''}`}
                    >
                      {attStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-center pt-4">
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-12 py-3.5 rounded-2xl transition-all shadow-lg shadow-brand-500/20 active:scale-95">
          Save Attendance
        </button>
      </div>

      {/* Modals */}
      <PayrollDetailsModal
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        onOpenSettings={() => {
          setShowPayrollModal(false);
          setShowPayrollSettingsModal(true);
        }}
      />

      <PayrollSettingsModal
        isOpen={showPayrollSettingsModal}
        onClose={() => setShowPayrollSettingsModal(false)}
      />

      <ManageWorkersModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        mode={attMode}
        onPersonSelect={(person) => {
          setSelectedPerson(person);
          setShowPersonDetailModal(true);
        }}
        onOpenCreatePerson={() => {
          setShowManageModal(false);
          setShowCreatePersonModal(true);
        }}
      />

      <PersonDetailModal
        isOpen={showPersonDetailModal}
        onClose={() => setShowPersonDetailModal(false)}
        person={selectedPerson}
      />

      <CreatePersonModal 
        isOpen={showCreatePersonModal}
        onClose={() => setShowCreatePersonModal(false)}
        mode={attMode}
      />
    </div>
  );
}
