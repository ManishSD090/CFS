/**
 * @param {{
 *   projects: Array<{
 *     id: number,
 *     name: string,
 *     location: string,
 *     status: string,
 *     progress: number,
 *     daysLeft: number,
 *     statusColor: 'green' | 'yellow' | 'red',
 *     barColor: 'blue' | 'yellow' | 'green' | 'red',
 *   }>
 * }} props
 */
export default function ActiveProjects({ projects }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Active Projects</h2>
        <button className="text-[11px] text-blue-500 dark:text-blue-400 font-medium hover:underline">
          View all
        </button>
      </div>

      {/* Project list */}
      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectRow key={project.id} {...project} />
        ))}
      </ul>
    </div>
  );
}

const STATUS_BADGE = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  yellow: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const BAR_COLOR = {
  blue: "bg-blue-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

function ProjectRow({ name, location, status, progress, daysLeft, statusColor, barColor }) {
  const badgeClass = STATUS_BADGE[statusColor] ?? STATUS_BADGE.green;
  const barClass = BAR_COLOR[barColor] ?? BAR_COLOR.blue;

  return (
    <li className="flex flex-col gap-2 pb-4 border-b border-gray-50 dark:border-slate-700 last:border-0 last:pb-0">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate">{name}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">{location}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer */}
      <p className="text-[11px] text-gray-400 dark:text-slate-400">
        {progress}% complete · {daysLeft} days left
      </p>
    </li>
  );
}