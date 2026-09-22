import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAllWorkers,
  getWorkerAttendance,
  bulkMarkWorkerAttendance,
  updateWorkerAttendance,
  markStaffAttendance,
  updateStaffAttendance,
  getAttendanceByDate,
  getProjectTeam,
  getAllUsers,
} from '../../../services/attendanceServices';

const WORKER_STATUS_OPTIONS = ['Present', 'Absent', 'Week Off', 'Paid Leave'];
const STAFF_STATUS_OPTIONS = ['Present', 'Absent', 'On Leave'];
const STATUS_COLORS = { Present: 'text-green-600 bg-green-50 border-green-200', Absent: 'text-red-500 bg-red-50 border-red-200', 'Week Off': 'text-orange-500 bg-orange-50 border-orange-200', 'Paid Leave': 'text-blue-500 bg-blue-50 border-blue-200', 'On Leave': 'text-blue-500 bg-blue-50 border-blue-200' };

function formatDateISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
}

export default function MarkAttendancePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Workers'); // 'Workers' | 'Staff'
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [workers, setWorkers] = useState([]); // All loaded workers (both management and site-staff)
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStaffSubmitted, setIsStaffSubmitted] = useState(false);
  const [isWorkersSubmitted, setIsWorkersSubmitted] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState(null);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    setWorkers([]);
    setIsStaffSubmitted(false);
    setIsWorkersSubmitted(false);

    try {
      const formattedDate = formatDateISO(selectedDate);

      // 1. Load assigned site-staff workers for the project
      const workersRes = await getAllWorkers({ projectId, date: selectedDate.toISOString() });
      const assignedWorkers = workersRes?.data || workersRes || [];

      const newWorkers = [];

      for (const w of assignedWorkers) {
        if (!newWorkers.some(x => x.id === w.id)) {
          newWorkers.push({
            id: w.id,
            name: w.name || 'Unknown',
            workerType: w.workerType || 'SITE_STAFF',
            designation: w.designation || 'Worker',
            isManagement: false,
            baseRate: w.dailyWageRate || 500,
            shiftMultiplier: 1.0,
            shiftTypeId: null,
            status: 'Present',
            attendanceRecordId: null,
          });
        }
      }

      // 2. Load project team (staff) with salary data
      try {
        const [teamRes, usersRes] = await Promise.all([
          getProjectTeam(projectId, selectedDate.toISOString()),
          getAllUsers(),
        ]);
        const teamAssignments = teamRes?.data || teamRes || [];
        const allUsers = usersRes?.data || usersRes || [];
        const salaryMap = {};
        for (const u of allUsers) salaryMap[u.id] = u;

        for (const assignment of teamAssignments) {
          const user = assignment.user;
          if (!user) continue;
          const userId = user.id;
          if (newWorkers.some(w => w.id === userId)) continue;
          const designation = user.designation || assignment.role?.name || 'Staff';
          if (designation.toLowerCase().includes('company admin')) continue;

          const fullUser = salaryMap[userId];
          const rawSalary = Number(fullUser?.salary || 0);
          const salaryType = fullUser?.salaryType || 'MONTHLY';
          const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
          let dailyRate = 0;
          if (salaryType === 'DAILY') dailyRate = rawSalary;
          else if (salaryType === 'WEEKLY') dailyRate = rawSalary / 7;
          else if (salaryType === 'HOURLY') dailyRate = rawSalary * 8;
          else dailyRate = rawSalary / daysInMonth;

          newWorkers.push({
            id: userId,
            name: user.name || 'Unknown',
            workerType: 'SITE_STAFF',
            designation,
            isManagement: true,
            baseRate: dailyRate,
            shiftMultiplier: 1.0,
            shiftTypeId: null,
            status: 'Present',
            attendanceRecordId: null,
          });
        }
      } catch (e) {
        console.warn('Could not load staff team:', e.message);
      }

      // 3. Apply existing worker attendance records
      try {
        const savedWorkerRes = await getWorkerAttendance(projectId, selectedDate.toISOString());
        const savedWorkerRecords = savedWorkerRes?.data || savedWorkerRes || [];
        let workersMarkedCount = 0;
        const totalSubcontractors = newWorkers.filter(w => !w.isManagement).length;

        for (const record of savedWorkerRecords) {
          const siteStaffId = record.siteStaffId?.toString() || '';
          const subId = record.subcontractorWorkerId?.toString() || '';
          const recordId = record.id?.toString() || '';
          const idx = newWorkers.findIndex(w => !w.isManagement && (w.id === siteStaffId || w.id === subId));
          if (idx >= 0) {
            workersMarkedCount++;
            const backendStatus = record.status?.toUpperCase() || 'PRESENT';
            newWorkers[idx].status = backendStatus === 'ABSENT' ? 'Absent' : 'Present';
            newWorkers[idx].attendanceRecordId = recordId;
            if (record.wageRate != null) newWorkers[idx].baseRate = Number(record.wageRate);
            if (record.shiftTypeId) newWorkers[idx].shiftTypeId = record.shiftTypeId;
            if (record.shiftMultiplier) newWorkers[idx].shiftMultiplier = Number(record.shiftMultiplier);
          }
        }
        if (totalSubcontractors > 0 && workersMarkedCount === totalSubcontractors) {
          setIsWorkersSubmitted(true);
        }
      } catch (e) {
        console.warn('Could not load worker attendance:', e.message);
      }

      // 4. Apply existing staff attendance records
      try {
        const staffAttRes = await getAttendanceByDate(projectId, selectedDate.toISOString());
        const savedStaffRecords = (staffAttRes?.data || staffAttRes || []).filter(
          r => (r.project?.id || r.projectId)?.toString() === projectId
        );
        let staffMarkedCount = 0;
        const totalStaff = newWorkers.filter(w => w.isManagement).length;

        for (const record of savedStaffRecords) {
          const staffId = record.user?.id?.toString() || record.userId?.toString() || '';
          const idx = newWorkers.findIndex(w => w.id === staffId && w.isManagement);
          if (idx >= 0) {
            staffMarkedCount++;
            newWorkers[idx].attendanceRecordId = record.id?.toString();
            const backendStatus = record.status?.toUpperCase() || 'PRESENT';
            if (backendStatus === 'ABSENT') newWorkers[idx].status = 'Absent';
            else if (['ON_LEAVE', 'PAID_LEAVE', 'WEEK_OFF'].includes(backendStatus)) newWorkers[idx].status = 'On Leave';
            else newWorkers[idx].status = 'Present';
          }
        }
        if (totalStaff > 0 && staffMarkedCount === totalStaff) {
          setIsStaffSubmitted(true);
        }
      } catch (e) {
        console.warn('Could not load staff attendance:', e.message);
      }

      setWorkers(newWorkers);
    } catch (e) {
      console.error('Error loading attendance:', e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const filtered = workers.filter(w => selectedRole === 'Staff' ? w.isManagement : !w.isManagement);
  const totalPayroll = filtered.reduce((sum, w) => {
    if (['Absent', 'Week Off', 'Paid Leave', 'On Leave'].includes(w.status)) return sum;
    return sum + w.baseRate * w.shiftMultiplier;
  }, 0);
  const presentCount = filtered.filter(w => w.status === 'Present').length;

  const isFrozen = (selectedRole === 'Staff' && isStaffSubmitted) || (selectedRole === 'Workers' && isWorkersSubmitted);
  const hideButton = isFrozen;

  const updateWorkerField = (id, field, value) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const removeWorker = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setActiveDeleteId(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedDate = formatDateISO(selectedDate);

      if (selectedRole === 'Workers') {
        const workerList = workers.filter(w => !w.isManagement);
        const toCreate = workerList.filter(w => !w.attendanceRecordId);
        const toUpdate = workerList.filter(w => w.attendanceRecordId);

        // Update existing records
        for (const w of toUpdate) {
          await updateWorkerAttendance(w.attendanceRecordId, {
            status: w.status === 'Present' ? 'PRESENT' : 'ABSENT',
            date: formattedDate,
            projectId,
            shiftMultiplier: w.shiftMultiplier,
            wageRate: w.baseRate,
            ...(w.shiftTypeId ? { shiftTypeId: w.shiftTypeId } : {}),
          });
        }

        // Bulk create new records
        if (toCreate.length > 0) {
          const res = await bulkMarkWorkerAttendance({
            projectId,
            date: formattedDate,
            attendanceData: toCreate.map(w => ({
              workerType: w.workerType,
              workerId: w.id,
              status: w.status === 'Present' ? 'PRESENT' : 'ABSENT',
              shiftMultiplier: w.shiftMultiplier,
              wageRate: w.baseRate,
              notes: 'Daily Worker Attendance',
              ...(w.shiftTypeId ? { shiftTypeId: w.shiftTypeId } : {}),
            })),
          });

          // Handle fallback for already-marked errors
          if (res?.errors) {
            for (const err of res.errors) {
              if (err.existingAttendanceId) {
                const idx = workers.findIndex(w => w.id === err.workerId);
                if (idx >= 0) {
                  await updateWorkerAttendance(err.existingAttendanceId, {
                    status: workers[idx].status === 'Present' ? 'PRESENT' : 'ABSENT',
                    date: formattedDate,
                    projectId,
                    shiftMultiplier: workers[idx].shiftMultiplier,
                  });
                }
              }
            }
          }
        }

        setIsWorkersSubmitted(true);
        await loadAttendance();
        alert('Workers Attendance Saved!');
      } else {
        const staffList = workers.filter(w => w.isManagement);
        const toCreate = staffList.filter(w => !w.attendanceRecordId);
        const toUpdate = staffList.filter(w => w.attendanceRecordId);

        const toBackendStatus = (s) => {
          if (s === 'Absent') return 'ABSENT';
          if (['On Leave', 'Paid Leave', 'Week Off'].includes(s)) return 'ON_LEAVE';
          return 'PRESENT';
        };

        for (const w of toUpdate) {
          await updateStaffAttendance(w.attendanceRecordId, {
            status: toBackendStatus(w.status),
            date: formattedDate,
            projectId,
          });
        }

        if (toCreate.length > 0) {
          const res = await markStaffAttendance({
            date: formattedDate,
            projectId,
            attendanceRecords: toCreate.map(w => ({
              userId: w.id,
              status: toBackendStatus(w.status),
              notes: 'Marked from Web Portal',
            })),
          });

          if (res?.errors) {
            for (const err of res.errors) {
              if (err.existingAttendanceId) {
                const idx = workers.findIndex(w => w.id === err.userId);
                if (idx >= 0) {
                  await updateStaffAttendance(err.existingAttendanceId, {
                    status: toBackendStatus(workers[idx].status),
                    date: formattedDate,
                    projectId,
                  });
                }
              }
            }
          }
        }

        setIsStaffSubmitted(true);
        await loadAttendance();
        alert('Staff Attendance Saved Successfully!');
      }
    } catch (e) {
      console.error('Submit error:', e);
      alert('Submission Error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" onClick={() => setActiveDeleteId(null)}>
      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Attendance</h1>
      </div>

      {/* Workers / Staff Toggle */}
      <div className="mx-5 my-4">
        <div className="h-12 p-1 bg-gray-100 rounded-[25px] flex">
          {['Workers', 'Staff'].map(role => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setActiveDeleteId(null); }}
              className={`flex-1 rounded-[21px] font-bold transition-colors text-sm ${selectedRole === role ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-600 bg-transparent'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Total Payroll Summary */}
      <div className="flex justify-between items-center px-5 mb-2">
        <span className="text-base font-bold text-gray-900">Total Payroll:</span>
        <span className="text-lg font-bold text-[#0066CC]">₹{Math.round(totalPayroll).toLocaleString('en-IN')}</span>
      </div>

      {/* Date Picker Row */}
      <div className="flex items-center gap-3 px-5 mb-3">
        <div className="flex-1 relative">
          <input
            type="date"
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              setSelectedDate(new Date(y, m - 1, d));
            }}
            className="w-full h-11 pl-4 pr-4 border border-blue-100 rounded-[25px] text-sm font-semibold bg-white focus:border-[#0066CC] outline-none"
          />
        </div>
        <button
          onClick={() => { const n = new Date(); setSelectedDate(new Date(n.getFullYear(), n.getMonth(), n.getDate())); }}
          className="px-4 py-2.5 border border-gray-300 rounded-[25px] text-sm bg-white text-gray-700 hover:bg-gray-50"
        >
          Today
        </button>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center px-5 mb-3">
        <span className="font-bold text-[#0066CC] text-sm">{presentCount}/{filtered.length} Present</span>
        {selectedRole === 'Workers' && !isFrozen && (
          <button
            onClick={() => navigate(`/admin/projects/${projectId}/attendance/add-worker`)}
            className="text-[#0066CC] font-bold text-sm hover:underline"
          >
            + Add Workers
          </button>
        )}
      </div>

      {/* Worker / Staff List */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No assigned {selectedRole.toLowerCase()} found for this date.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(worker => {
              const isDeleting = activeDeleteId === worker.id;
              const isStaffTab = selectedRole === 'Staff';
              const isNonPresent = ['Absent', 'Week Off', 'Paid Leave', 'On Leave'].includes(worker.status);

              return (
                <div
                  key={worker.id}
                  onClick={e => e.stopPropagation()}
                  onContextMenu={e => { e.preventDefault(); if (!isStaffTab && !isFrozen) setActiveDeleteId(worker.id); }}
                  className={`p-3 rounded-xl border transition-colors ${isDeleting ? 'bg-red-50 border-red-200' : isFrozen ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-center gap-2">
                    {/* Name + Designation */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isFrozen ? 'text-gray-500' : 'text-gray-900'}`}>{worker.name}</p>
                      <p className="text-xs text-gray-400 truncate">{worker.designation}</p>
                    </div>

                    {isDeleting ? (
                      <button onClick={() => removeWorker(worker.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    ) : (
                      <>
                        {/* Rate display (Workers only) */}
                        {!isStaffTab && (
                          <div className={`w-16 text-center text-xs font-bold py-1 rounded-lg ${isFrozen || isNonPresent ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#0066CC] border border-blue-100'}`}>
                            {isNonPresent ? '₹0' : `₹${Math.round(worker.baseRate * worker.shiftMultiplier)}`}
                          </div>
                        )}

                        {/* Status Dropdown */}
                        <div className={`border rounded-lg px-1 ${STATUS_COLORS[worker.status] || 'border-gray-200'} ${isFrozen ? 'opacity-70' : ''}`}>
                          <select
                            disabled={isFrozen}
                            value={worker.status}
                            onChange={e => updateWorkerField(worker.id, 'status', e.target.value)}
                            className="bg-transparent text-xs font-bold outline-none py-1 pr-4 pl-1 cursor-pointer disabled:cursor-default"
                          >
                            {(isStaffTab ? STAFF_STATUS_OPTIONS : WORKER_STATUS_OPTIONS).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!hideButton && (
        <div className="px-5 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            disabled={isSubmitting || filtered.length === 0}
            onClick={handleSubmit}
            className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-full text-base hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : `Submit ${selectedRole} Attendance`}
          </button>
        </div>
      )}
    </div>
  );
}
