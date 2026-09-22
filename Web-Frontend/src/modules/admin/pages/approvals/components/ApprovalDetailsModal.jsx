import React, { useState } from "react";
import { approvalService } from "../../../services/approval.service";

export default function ApprovalDetailsModal({ isOpen, onClose, data, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(null); 
  const [showConfirmation, setShowConfirmation] = useState(null); 
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !data) return null;

  const isPending = data.status === "PENDING" || data.status === "SUBMITTED";
  const isTimeline = data.approvalType?.toLowerCase() === "timeline";

  const handleAction = async (status) => {
    setIsProcessing(status); 
    
    try {
      await approvalService.updateStatus(data.approvalType, data.id || data._id, status, remarks);
      
      setShowConfirmation(status);
      
      if (onSuccess) onSuccess(); 
      
      setTimeout(() => {
        setShowConfirmation(null);
        setRemarks("");
        onClose();
      }, 2000);

    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
      alert(error.response?.data?.message || "Failed to process request. Please check your database connection.");
    } finally {
      setIsProcessing(null); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const tableItems = data.items || data.particulars || data.budgetItems || [];

  return (
    <>
      <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-wrap bg-black/40 fade-up">
        {showConfirmation ? (
            <div className="status-popup-overlay flex items-center justify-center !static bg-transparent z-[100] w-full">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-2xl border border-slate-100 dark:border-slate-700 fade-up pointer-events-auto">
                    {showConfirmation === 'APPROVED' ? (
                        <div className="w-16 h-16 rounded-full bg-[#00b894]/10 text-[#00b894] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-[#ff4757]/10 text-[#ff4757] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {data.approvalType.charAt(0).toUpperCase() + data.approvalType.slice(1)} {showConfirmation === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </h3>
                </div>
            </div>
        ) : (
            <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-xl border border-slate-100 dark:border-slate-700 fade-up p-8 overflow-hidden">
                
                <button onClick={() => { setRemarks(""); setIsProcessing(null); onClose(); }} className="absolute top-6 right-6 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {isTimeline ? (data.timelineDetails?.monthYear || "Timeline Request") : (data.project?.name || data.projectName || "Project Budget")}
                    </h2>
                    <p className="text-slate-400 font-medium mt-1">
                        {isTimeline ? (data.project?.name || data.projectName || "Company Name") : "Location"}
                    </p>
                    <span className="text-brand-500 font-semibold text-sm mt-1 inline-block">
                        {data.submitterName || "Manager Name"}
                    </span>
                    <div className="text-xs text-slate-300 font-medium mt-3 space-y-1">
                        <p>Received: {formatDate(data.createdAt)}</p>
                        <p>Sent: {formatDate(data.displayDate || data.createdAt)}</p>
                    </div>
                </div>

                {!isTimeline && (
                    <div className="overflow-hidden mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                    <th className="pb-3 w-16">Sr. No.</th>
                                    <th className="pb-3">Particulars</th>
                                    <th className="pb-3">Quantity</th>
                                    <th className="pb-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {tableItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400 border-b border-slate-50 border-dashed">No particulars provided</td>
                                    </tr>
                                ) : (
                                    tableItems.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-50 dark:border-slate-700/50">
                                            <td className="py-4">{String(index + 1).padStart(2, '0')}</td>
                                            <td className="py-4 truncate max-w-[150px]">{item.particular || item.name}</td>
                                            <td className="py-4">{item.quantity || "—"}</td>
                                            <td className="py-4 text-right">₹{(item.amount || 0).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))
                                )}
                                <tr className="font-bold text-base border-t border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                                    <td className="pt-6">Total</td>
                                    <td className="pt-6"></td>
                                    <td className="pt-6">{tableItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || "—"}</td>
                                    <td className="pt-6 text-right">₹{(tableItems.reduce((s, i) => s + (Number(i.amount) || 0), 0) || data.totalAmount || data.totalBudget || 0).toLocaleString('en-IN')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                
                {isTimeline && (
                    <div className="mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                        {data.timelineDetails?.weeks?.map(week => (
                            <div key={week.id} className="mb-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Week {week.id}: {week.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{week.taskCount} tasks planned</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Remarks</label>
                    <textarea 
                        value={isPending ? remarks : (data.remarks || remarks || "")}
                        onChange={(e) => setRemarks(e.target.value)}
                        readOnly={!isPending}
                        placeholder={isPending ? "Enter the notes..." : "No remarks"}
                        className="field-input w-full h-28 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    />
                </div>

                {isPending && (
                    <div className="flex gap-4">
                        <button onClick={() => handleAction('APPROVED')} disabled={isProcessing !== null} style={{ backgroundColor: '#00b894' }} className="flex-1 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-[#00b894]/20 hover:opacity-90 flex justify-center items-center">
                            {isProcessing === 'APPROVED' ? "Processing..." : 'Approve'}
                        </button>
                        <button onClick={() => handleAction('REJECTED')} disabled={isProcessing !== null} style={{ backgroundColor: '#ff4757' }} className="flex-1 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-[#ff4757]/20 hover:opacity-90 flex justify-center items-center">
                            {isProcessing === 'REJECTED' ? "Processing..." : 'Reject'}
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </>
  );
}
