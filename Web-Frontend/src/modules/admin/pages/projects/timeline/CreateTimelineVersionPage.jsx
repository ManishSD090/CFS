import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTimelineVersions, createTimelineVersion } from '../../../services/timelineServices';

export default function CreateTimelineVersionPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  // timelineId passed via query string from the Timeline Tab
  const timelineId = new URLSearchParams(window.location.search).get('timelineId');

  const [availableVersions, setAvailableVersions] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changesSummary, setChangesSummary] = useState('');
  const [isBaseline, setIsBaseline] = useState(false);
  const [copyFromVersion, setCopyFromVersion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!timelineId) return;
    setIsLoading(true);
    getTimelineVersions(timelineId)
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setAvailableVersions(list);
        // Auto-name
        if (list.length > 0) {
          const maxVer = Math.max(...list.map(v => v.versionNumber));
          setName(`Version ${maxVer + 1}`);
        } else {
          setName('Version 1');
        }
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [timelineId]);

  const handleSubmit = async () => {
    if (!name.trim()) { alert('Version name is required.'); return; }
    if (!startDate || !endDate) { alert('Please select start and end dates.'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        startDate,
        endDate,
        changesSummary: changesSummary.trim(),
        isBaseline,
        ...(copyFromVersion && { copyFromVersion }),
      };
      await createTimelineVersion(timelineId, payload);
      navigate(-1);
    } catch (e) {
      alert('Error creating version: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0066CC] bg-white";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* App Bar */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 py-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-3 p-1.5 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">New Timeline Version</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 pb-24">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : (
          <>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1">Version Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Version 2: Re-planning" className={inputCls} />

            <label className="block text-[13px] font-semibold text-gray-700 mt-4 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Brief description of this version"
              className={`${inputCls} resize-none`} />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">End Date</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
              </div>
            </div>

            <label className="block text-[13px] font-semibold text-gray-700 mt-4 mb-1">Changes Summary</label>
            <textarea value={changesSummary} onChange={e => setChangesSummary(e.target.value)} rows={2}
              placeholder="What changed in this version?"
              className={`${inputCls} resize-none`} />

            <div className="my-5 border-t border-gray-200" />

            {/* Copy from previous version */}
            {availableVersions.length > 0 && (
              <>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Copy tasks from previous version (Optional)</label>
                <select value={copyFromVersion} onChange={e => setCopyFromVersion(e.target.value)} className={inputCls}>
                  <option value="">Select a version to copy tasks from</option>
                  {availableVersions.map(v => (
                    <option key={v.id} value={v.versionNumber}>{v.versionNumber} - {v.name}</option>
                  ))}
                </select>
              </>
            )}

            {/* Set as Baseline */}
            <div className="mt-5 flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <input type="checkbox" id="baseline" checked={isBaseline} onChange={e => setIsBaseline(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-[#0066CC] cursor-pointer" />
              <label htmlFor="baseline" className="cursor-pointer">
                <p className="text-sm font-semibold text-gray-800">Set as Baseline?</p>
                <p className="text-xs text-gray-500 mt-0.5">This will make this version the standard for comparison.</p>
              </label>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-8 w-full py-4 bg-[#0066CC] text-white font-bold rounded-full text-base hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/30"
            >
              {isSubmitting ? 'Creating...' : 'Create Version'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
