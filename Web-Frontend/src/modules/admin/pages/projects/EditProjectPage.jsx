import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { updateProject, getProjectById } from '../../services/projectServices';

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!location.state?.project);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    startDate: '',
    estimatedEndDate: '',
    estimatedBudget: '',
    advanceReceived: '',
    contractValue: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    if (location.state?.project) {
      populateForm(location.state.project);
    } else {
      fetchProject();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await getProjectById(id);
      if (res.success && res.data) {
        populateForm(res.data);
      }
    } catch (e) {
      alert("Failed to load project details: " + e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const populateForm = (proj) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

    setFormData({
      name: proj.name || '',
      description: proj.description || '',
      location: proj.location || '',
      latitude: proj.latitude || '',
      longitude: proj.longitude || '',
      startDate: formatDate(proj.startDate),
      estimatedEndDate: formatDate(proj.estimatedEndDate),
      estimatedBudget: proj.estimatedBudget || '',
      advanceReceived: proj.advanceReceived || '',
      contractValue: proj.contractValue || '',
      priority: proj.priority || 'MEDIUM',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to update this project?");
    if (!confirmed) return;

    setIsLoading(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      latitude: parseFloat(formData.latitude) || 0.0,
      longitude: parseFloat(formData.longitude) || 0.0,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      estimatedBudget: parseFloat(formData.estimatedBudget) || 0.0,
      advanceReceived: parseFloat(formData.advanceReceived) || 0.0,
      contractValue: parseFloat(formData.contractValue) || 0.0,
      priority: formData.priority,
    };

    try {
      await updateProject(id, payload);
      alert("Project Updated Successfully!");
      navigate(-1);
    } catch (error) {
      alert(`Error updating project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* App Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-800 mr-3 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-gray-900 text-[18px] font-bold flex-1 text-center">Edit Project</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      <div className="max-w-2xl mx-auto p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label text="Project Name" />
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Project Name" required />
          </div>

          <div>
            <Label text="Description" />
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Project Description"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none transition-colors"
            />
          </div>

          <div>
            <Label text="Location" />
            <Input name="location" value={formData.location} onChange={handleChange} placeholder="Project Location" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label text="Latitude" />
              <Input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="Lat" />
            </div>
            <div className="flex-1">
              <Label text="Longitude" />
              <Input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="Lng" />
            </div>
          </div>

          <div>
            <Label text="Priority" />
            <select 
              name="priority" 
              value={formData.priority} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none transition-colors bg-white"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label text="Start date" />
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="flex-1">
              <Label text="End date" />
              <Input name="estimatedEndDate" type="date" value={formData.estimatedEndDate} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label text="Estimated budget" />
              <Input name="estimatedBudget" type="number" value={formData.estimatedBudget} onChange={handleChange} placeholder="Budget" />
            </div>
            <div className="flex-1">
              <Label text="Advanced received" />
              <Input name="advanceReceived" type="number" value={formData.advanceReceived} onChange={handleChange} placeholder="Advance" />
            </div>
          </div>

          <div>
            <Label text="Contract Value" />
            <Input name="contractValue" type="number" value={formData.contractValue} onChange={handleChange} placeholder="Contract Value" />
          </div>
          
          <div className="pt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 bg-[#0D6EFD] text-white font-bold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ text }) {
  return <label className="block text-sm font-medium text-gray-800 mb-1.5 mt-2">{text}</label>;
}

function Input({ ...props }) {
  return (
    <input 
      {...props} 
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none transition-colors bg-white"
    />
  );
}
