import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDPRById, updateDPR } from '../../../services/dprServices';

export default function EditDprPage() {
  const { id, dprId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    weather: 'Sunny',
    workersPresent: 0,
    staffPresent: 0,
    workDescription: '',
    taskName: '',
    percentage: 0,
    subtasks: '',
    pendingWork: '',
    challenges: '',
    safetyObservations: '',
    qualityChecks: '',
    issuesFound: '',
    nextDayPlan: ''
  });

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: 'Nos' });

  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({ name: '', hours: '' });

  useEffect(() => {
    fetchDpr();
    // eslint-disable-next-line
  }, [dprId]);

  const fetchDpr = async () => {
    try {
      const res = await getDPRById(dprId);
      if (res.success) {
        const d = res.data;
        
        let tName = d.completedWork || "";
        let perc = 0;
        let sub = "";

        if (tName.includes('Subtasks:')) {
          const parts = tName.split('Subtasks:');
          tName = parts[0].trim();
          sub = parts[1].trim();
        }

        const match = tName.match(/\((\d+)%\)/);
        if (match) {
          perc = parseInt(match[1], 10);
          tName = tName.replace(match[0], '').trim();
        }

        setFormData({
          date: d.date ? d.date.split('T')[0] : '',
          weather: d.weather || 'Sunny',
          workersPresent: d.workersPresent || d.totalWorkers || 0,
          staffPresent: d.staffPresent || 0,
          workDescription: d.workDescription || '',
          taskName: tName,
          percentage: perc,
          subtasks: sub,
          pendingWork: d.pendingWork || '',
          challenges: d.challenges || '',
          safetyObservations: d.safetyObservations || '',
          qualityChecks: d.qualityChecks || '',
          issuesFound: d.issuesFound || '',
          nextDayPlan: d.nextDayPlan || ''
        });

        if (d.materialConsumptions) {
          setMaterials(d.materialConsumptions.map(m => ({
            material: m.material?.name || m.material || '',
            quantity: m.quantity,
            unit: m.unit || 'Nos'
          })));
        }

        if (d.equipmentUsage) {
          setEquipments(d.equipmentUsage.map(e => ({
            name: e.name,
            hours: e.hours
          })));
        }
      }
    } catch (e) {
      alert("Error loading DPR: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.quantity) {
      setMaterials([...materials, { material: newMaterial.name, quantity: Number(newMaterial.quantity), unit: newMaterial.unit }]);
      setNewMaterial({ name: '', quantity: '', unit: 'Nos' });
    }
  };

  const handleRemoveMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleAddEquipment = () => {
    if (newEquipment.name && newEquipment.hours) {
      setEquipments([...equipments, { name: newEquipment.name, hours: Number(newEquipment.hours) }]);
      setNewEquipment({ name: '', hours: '' });
    }
  };

  const handleRemoveEquipment = (index) => {
    setEquipments(equipments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    let compWork = formData.taskName;
    if (formData.percentage > 0) compWork += ` (${formData.percentage}%)`;
    if (formData.subtasks.trim()) compWork += ` Subtasks: ${formData.subtasks}`;

    const payload = {
      ...formData,
      completedWork: compWork,
      materialConsumptions: materials,
      equipmentUsage: equipments,
    };

    try {
      await updateDPR(dprId, payload);
      alert("DPR updated successfully");
      navigate(-1);
    } catch (error) {
      alert("Failed to update DPR: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0 shadow-md">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Edit DPR</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form id="edit-dpr-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          
          {/* General Details */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">General Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Weather</label>
                <select name="weather" value={formData.weather} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-white">
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">Attendance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Workers Present</label>
                <input type="number" name="workersPresent" value={formData.workersPresent} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Staff Present</label>
                <input type="number" name="staffPresent" value={formData.staffPresent} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-[#0066CC] font-bold mb-2">Work Details</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Work Description *</label>
              <textarea required name="workDescription" value={formData.workDescription} onChange={handleChange} className="w-full border rounded p-2 text-sm h-24"></textarea>
            </div>

            <div className="p-3 border rounded bg-gray-50 space-y-3">
              <label className="block text-xs font-bold text-gray-700">Completed Work Breakdown</label>
              <input required type="text" name="taskName" value={formData.taskName} onChange={handleChange} placeholder="Main Task Name *" className="w-full border rounded p-2 text-sm" />
              <input type="number" name="percentage" value={formData.percentage} onChange={handleChange} placeholder="Percentage Completed (%)" className="w-full border rounded p-2 text-sm" />
              <textarea name="subtasks" value={formData.subtasks} onChange={handleChange} placeholder="Subtasks completed..." className="w-full border rounded p-2 text-sm h-16"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pending Work</label>
              <textarea name="pendingWork" value={formData.pendingWork} onChange={handleChange} className="w-full border rounded p-2 text-sm h-20"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Challenges / Roadblocks</label>
              <textarea name="challenges" value={formData.challenges} onChange={handleChange} className="w-full border rounded p-2 text-sm h-20"></textarea>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">Materials Consumed</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Material Name" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="flex-1 border rounded p-2 text-sm" />
              <input type="number" placeholder="Qty" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: e.target.value})} className="w-20 border rounded p-2 text-sm" />
              <input type="text" placeholder="Unit" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-20 border rounded p-2 text-sm" />
              <button type="button" onClick={handleAddMaterial} className="bg-gray-200 px-3 rounded font-bold text-sm">+</button>
            </div>
            <div className="space-y-2">
              {materials.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 border rounded">
                  <span>{m.material}</span>
                  <span className="font-bold">{m.quantity} {m.unit}</span>
                  <button type="button" onClick={() => handleRemoveMaterial(i)} className="text-red-500 font-bold">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">Equipment Usage</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Equipment Name" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} className="flex-1 border rounded p-2 text-sm" />
              <input type="number" placeholder="Hours" value={newEquipment.hours} onChange={e => setNewEquipment({...newEquipment, hours: e.target.value})} className="w-24 border rounded p-2 text-sm" />
              <button type="button" onClick={handleAddEquipment} className="bg-gray-200 px-3 rounded font-bold text-sm">+</button>
            </div>
            <div className="space-y-2">
              {equipments.map((e, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 border rounded">
                  <span>{e.name}</span>
                  <span className="font-bold">{e.hours} Hrs</span>
                  <button type="button" onClick={() => handleRemoveEquipment(i)} className="text-red-500 font-bold">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-[#0066CC] font-bold mb-2">Observations</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Safety Observations</label>
              <textarea name="safetyObservations" value={formData.safetyObservations} onChange={handleChange} className="w-full border rounded p-2 text-sm h-16"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quality Checks</label>
              <textarea name="qualityChecks" value={formData.qualityChecks} onChange={handleChange} className="w-full border rounded p-2 text-sm h-16"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Issues Found</label>
              <textarea name="issuesFound" value={formData.issuesFound} onChange={handleChange} className="w-full border rounded p-2 text-sm h-16"></textarea>
            </div>
          </div>

          {/* Next Day Plan */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">Next Day Plan</h3>
            <textarea name="nextDayPlan" value={formData.nextDayPlan} onChange={handleChange} className="w-full border rounded p-2 text-sm h-24"></textarea>
          </div>

        </form>
      </div>

      <div className="bg-white p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t">
        <button 
          type="submit"
          form="edit-dpr-form"
          disabled={isSaving}
          className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-full text-[16px] hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
