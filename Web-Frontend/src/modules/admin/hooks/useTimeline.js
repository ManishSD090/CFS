import { useEffect, useState } from "react";
import {
  getTimelines,
  createTimeline,
  updateTimeline,
  getTimelineProgress,
} from "../services/timeline.service";

import { mapTimeline } from "../adapters/timeline.adapter";

const useTimeline = (projectId) => {
  const [timelines, setTimelines] = useState([]);
  const [currentTimeline, setCurrentTimeline] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimelines = async () => {
    try {
      setLoading(true);

      const list = await getTimelines({ projectId });

      setTimelines(list);

      if (list.length > 0) {
        const mapped = mapTimeline(list[0]);
        setCurrentTimeline(mapped);

        try {
          const progressRes = await getTimelineProgress(list[0].id);
          setProgress(progressRes);
        } catch (progErr) {
          console.warn("Timeline progress error (ignored):", progErr);
          setProgress(null);
        }
      }
    } catch (err) {
      console.error("Timeline error:", err);
      setError("Failed to load timelines");
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload) => {
    await createTimeline({ ...payload, projectId });
    await fetchTimelines();
  };

  const update = async (id, payload) => {
    await updateTimeline(id, payload);
    await fetchTimelines();
  };

  useEffect(() => {
    if (projectId) {
      fetchTimelines();
    }
  }, [projectId]);

  return {
    timelines,
    currentTimeline,
    progress,
    loading,
    error,
    refetch: fetchTimelines,
    create,
    update,
  };
};
 
export default useTimeline;