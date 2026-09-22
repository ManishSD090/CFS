import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getDPRById, approveDPR } from '../../../services/dprServices';

export default function DprDetailsPage() {
  const { id, dprId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get('readOnly') === '1';
  
  const [dpr, setDpr] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchDPR();
    // eslint-disable-next-line
  }, [dprId]);

  const fetchDPR = async () => {
    setIsLoading(true);
    try {
      const res = await getDPRById(dprId);
      if (res.success) {
        setDpr(res.data);
      }
    } catch (e) {
      alert("Failed to load DPR details: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForApproval = async () => {
    setIsApproving(true);
    try {
      await approveDPR(dprId, { status: 'REVIEW' });
      alert("Sent for inspection successfully!");
      navigate(-1);
    } catch (e) {
      alert("Failed to send: " + e.message);
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
    );
  }

  if (!dpr) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
          <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white text-[18px] font-bold">DPR Details</h1>
        </div>
        <div className="flex-1 flex justify-center items-center text-red-500">DPR not found.</div>
      </div>
    );
  }

  // Header Details
  const dDate = new Date(dpr.date);
  const formattedDate = `${("0"+dDate.getDate()).slice(-2)} ${dDate.toLocaleString('en-US', {month: 'short'})} ${dDate.getFullYear()}`.toUpperCase();
  const weather = dpr.weather || "Sunny";
  const visitors = dpr.siteVisitors?.length > 0 ? dpr.siteVisitors.map(v => v.name).join(', ') : "None";
  const projectName = dpr.project?.name || dpr.projectName || "Project";
  const shortId = dpr.reportNo ? `ID-${dpr.reportNo.slice(-4)}` : '';

  // Parsed Completed Work
  let taskName = dpr.completedWork || "";
  let percent = "";
  let subtasks = "";

  if (taskName.includes('Subtasks:')) {
    const parts = taskName.split('Subtasks:');
    taskName = parts[0].trim();
    subtasks = parts[1].trim();
  }

  const match = taskName.match(/\((\d+)%\)/);
  if (match) {
    percent = `${match[1]}%`;
    taskName = taskName.replace(match[0], '').trim();
  }

  if (!taskName) taskName = "No tasks recorded";

  const workers = (dpr.totalWorkers || dpr.workersPresent || 0);
  const staff = (dpr.staffPresent || 0);
  const totalAttendance = workers + staff;

  const status = (dpr.status || '').toUpperCase();
  const isApproved = status === "APPROVED" || status === "COMPLETED";
  const isPending = status === "REVIEW";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold flex-1">{readOnly ? 'DPR Inspection' : 'DPR Details'}</h1>
        {!readOnly && (
          <button onClick={() => navigate(`/admin/projects/${id}/dpr/edit/${dprId}`)} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Header Section */}
        <div>
        {!readOnly && (
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[18px] font-black text-gray-900">{formattedDate}</h2>
          </div>
        )}
        {readOnly && (
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[18px] font-black text-gray-900">{formattedDate}</h2>
            <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-[#0066CC] rounded-lg uppercase tracking-wider">Pending Inspection</span>
          </div>
        )}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[13px] font-bold text-[#0066CC] truncate flex-1">{projectName}</span>
            <span className="text-[12px] font-bold text-gray-500">{shortId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold text-gray-900">Site Visitor: {visitors}</span>
            <div className="flex items-center gap-1 text-[#0066CC]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span className="text-[12px] font-bold">{weather}</span>
            </div>
          </div>
        </div>

        {/* Work Description */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Work Description</h3>
          <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
            {dpr.workDescription?.trim() ? dpr.workDescription : "No details provided."}
          </div>
        </div>

        {/* Tasks & Subtasks */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Tasks & Subtasks</h3>
          <div className="p-3 bg-white border border-gray-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-gray-900 flex-1">{taskName}</span>
              {percent && (
                <div className="px-2 py-1 bg-blue-50 text-[#0066CC] rounded-lg text-[12px] font-bold">
                  {percent}
                </div>
              )}
            </div>
            {subtasks && (
              <>
                <hr className="my-2 border-gray-200" />
                <p className="text-[12px] font-bold text-gray-500 mb-1">Subtasks:</p>
                <p className="text-[13px] text-gray-800 leading-relaxed">{subtasks}</p>
              </>
            )}
          </div>
        </div>

        {/* Pending Work */}
        {dpr.pendingWork?.trim() && (
          <div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Pending Work</h3>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
              {dpr.pendingWork}
            </div>
          </div>
        )}

        {/* Challenges */}
        {dpr.challenges?.trim() && (
          <div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Challenges / Roadblocks</h3>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
              {dpr.challenges}
            </div>
          </div>
        )}

        {/* Attendance */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Attendance (Total: {totalAttendance})</h3>
          <hr className="mb-3 border-gray-300" />
          <div className="flex justify-between mb-2">
            <span className="text-[13px] font-bold text-gray-900">Workers</span>
            <span className="text-[13px] font-bold text-[#0066CC]">{workers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] font-bold text-gray-900">Staff</span>
            <span className="text-[13px] font-bold text-[#0066CC]">{staff}</span>
          </div>
        </div>

        {/* Materials Consumed */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Materials Consumed</h3>
          <hr className="mb-3 border-gray-300" />
          {!dpr.materialConsumptions || dpr.materialConsumptions.length === 0 ? (
            <p className="text-[13px] text-gray-500">No materials recorded</p>
          ) : (
            dpr.materialConsumptions.map((m, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span className="text-[13px] font-bold text-gray-900">{m.material?.name || "Material"}</span>
                <span className="text-[13px] font-bold text-[#0066CC]">{m.quantity} {m.unit || 'Nos'}</span>
              </div>
            ))
          )}
        </div>

        {/* Equipments Used */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Equipments Used</h3>
          <hr className="mb-3 border-gray-300" />
          {!dpr.equipmentUsage || dpr.equipmentUsage.length === 0 ? (
            <p className="text-[13px] text-gray-500">No equipment recorded</p>
          ) : (
            dpr.equipmentUsage.map((e, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span className="text-[13px] font-bold text-gray-900">{e.name || "Equipment"}</span>
                <span className="text-[13px] font-bold text-[#0066CC]">{e.hours} Hrs used</span>
              </div>
            ))
          )}
        </div>

        {/* Observations */}
        {dpr.safetyObservations?.trim() && (
          <div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Safety Observations</h3>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
              {dpr.safetyObservations}
            </div>
          </div>
        )}

        {dpr.qualityChecks?.trim() && (
          <div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Quality Checks</h3>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
              {dpr.qualityChecks}
            </div>
          </div>
        )}

        {dpr.issuesFound?.trim() && (
          <div>
            <h3 className="text-[15px] font-black text-gray-900 mb-2">Issues Found</h3>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
              {dpr.issuesFound}
            </div>
          </div>
        )}

        {/* Media place holders */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Photos</h3>
          <p className="text-[13px] text-gray-500">No photos attached.</p>
        </div>
        
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Documents</h3>
          <p className="text-[13px] text-gray-500">No documents attached.</p>
        </div>

        <hr className="border-gray-400" />
        
        {/* Next Day Plan */}
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-2">Next Day Plan</h3>
          <div className="p-3 bg-white border border-gray-300 rounded-lg text-[13px] text-gray-800 leading-relaxed">
            {dpr.nextDayPlan?.trim() ? dpr.nextDayPlan : "No plans provided for the next day."}
          </div>
        </div>

      </div>

      {/* Bottom Action Bar — hidden in readOnly/inspection mode */}
      {!readOnly && (
        <div className="bg-white p-4 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] shrink-0">
          <button
            disabled={isApproved || isPending || isApproving}
            onClick={handleSendForApproval}
            className={`w-full py-3.5 rounded-full font-bold text-[15px] text-white ${
              isApproved || isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#17A589] hover:bg-[#12876f]'
            }`}
          >
            {isApproving ? "Sending..." : isApproved ? "Approved" : isPending ? "Pending Inspection" : "Send For Approval"}
          </button>
        </div>
      )}

    </div>
  );
}
