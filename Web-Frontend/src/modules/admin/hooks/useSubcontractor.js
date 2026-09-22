import { useState, useCallback, useEffect } from "react";
import {
  getSubcontractors,
  createSubcontractor,
  createContractorProject,
  updateSubcontractor,
  updateContractorProject,
  deleteContractorProject,
  deleteSubcontractor
} from "../services/subcontractor.service";

const useSubcontractor = (projectId) => {
  const [subcontractors, setSubcontractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubcontractors = useCallback(async () => {
    if (!projectId) return;
    try {
      // Fetch ALL subcontractors globally map it for the UI
      const list = await getSubcontractors();
      
      console.log("Fetched globally:", list);
      const mapped = list.map(item => ({
        // Global contractor does not have a local project assignment ID yet
        contractorProjectId: null,
        
        // The Contractor ID and details
        id: item.id,
        name: item.name || "N/A",
        phone: item.phone || "",
        email: item.email || "",
        workType: item.workTypes?.join(", ") || "",
        status: item.status || "Active",
        type: item.type || "Company",
        
        // No specific project assignment details natively
        start: 'N/A',
        end: 'N/A',
        rawStartDate: null,
        rawEndDate: null,
        contract: 0,
        budget: 0, 
        
        // Stats
        workers: item.stats?.totalWorkers || 0,
        project: "N/A"
      }));
      console.log("Mapped subcontractors:", mapped);
      setSubcontractors(mapped);
    } catch (err) {
      console.error("Failed to load subcontractors:", err?.response?.data || err);
      setError("Failed to fetch subcontractors.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Hook into mount/projectId change
  useEffect(() => {
    fetchSubcontractors();
  }, [fetchSubcontractors]);

  // Unified creation logic
  const addSubcontractor = async (data) => {
    try {
      setLoading(true);
      const resolvedWorkType = data.workType || "General";
      
      // 1. Create the contractor
      const contractorPayload = {
        name: data.name,
        type: "Company", 
        workTypes: [resolvedWorkType],
        phone: data.phone || undefined,
        email: data.email || undefined,
      };
      const newContractor = await createSubcontractor(contractorPayload);

      // 2. Assign to Project
      const projectPayload = {
        title: `${data.name} - Contract`,
        workType: resolvedWorkType,
        startDate: data.start || undefined,
        endDate: data.end || undefined,
        contractAmount: data.contract ? parseFloat(data.contract) : undefined,
      };
      console.log("Creating contractor project with payload", projectPayload, "for builder:", newContractor);
      
      await createContractorProject(newContractor.id, projectId, projectPayload);
      
      await fetchSubcontractors();
      return true;
    } catch (err) {
      console.error("Create subcontractor error detailing:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Failed to create subcontractor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unified update logic
  const editSubcontractor = async (contractorId, contractorProjectId, data) => {
    try {
      setLoading(true);
      
      // Update global contractor
      if (contractorId) {
        await updateSubcontractor(contractorId, {
          name: data.name,
          workTypes: data.workType ? [data.workType] : undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
        });
      }
      
      // Update local project assignment
      if (contractorProjectId) {
        await updateContractorProject(contractorProjectId, {
          startDate: data.start || undefined,
          endDate: data.end || undefined,
          contractAmount: data.contract ? parseFloat(data.contract) : undefined,
        });
      }

      await fetchSubcontractors();
      return true;
    } catch (err) {
      console.error("Update subcontractor error:", err);
      setError("Failed to update subcontractor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove assignment from project
  const removeSubcontractorProject = async (contractorProjectId) => {
    try {
      setLoading(true);
      await deleteContractorProject(contractorProjectId);
      await fetchSubcontractors();
      return true;
    } catch (err) {
      console.error("Delete subcontractor project error:", err);
      setError(err?.response?.data?.message || "Failed to remove subcontractor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove global subcontractor entirely
  const removeSubcontractor = async (contractorId) => {
    try {
      setLoading(true);
      await deleteSubcontractor(contractorId);
      await fetchSubcontractors();
      return true;
    } catch (err) {
      console.error("Delete subcontractor error:", err);
      setError(err?.response?.data?.message || "Failed to remove subcontractor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subcontractors,
    loading,
    error,
    refetch: fetchSubcontractors,
    addSubcontractor,
    editSubcontractor,
    removeSubcontractorProject,
    removeSubcontractor
  };
};

export default useSubcontractor;
