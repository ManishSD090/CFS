export const mapTimeline = (timeline) => {
  if (!timeline) return null;

  const weeksMap = {};

  timeline.timelineTasks?.forEach((t) => {
    const key = `Week ${t.week || 1}`;

    if (!weeksMap[key]) {
      weeksMap[key] = {
        label: key,
        tasks: [],
      };
    }

    weeksMap[key].tasks.push({
      id: t.id,
      name: t.task?.title || "Untitled Task",
      sub: t.task?.subTasks?.map(st => st.title) || [], // Assuming subTasks key
    });
  });

  return {
    id: timeline.id,
    name: timeline.name,
    startDate: timeline.startDate,
    endDate: timeline.endDate,
    weeks: Object.values(weeksMap).sort((a, b) => {
      const aNum = parseInt(a.label.split(' ')[1]);
      const bNum = parseInt(b.label.split(' ')[1]);
      return aNum - bNum;
    }),
    gantt: timeline.timelineTasks?.map(t => ({
      name: t.task?.title || "Untitled",
      bars: [
        { 
          col: Math.floor(Math.random() * 5) + 1, // Mocking Gantt pos for now
          span: Math.floor(Math.random() * 3) + 1,
          color: t.task?.priority === 'High' ? '#ef4444' : '#3b82f6'
        }
      ]
    })) || []
  };
};