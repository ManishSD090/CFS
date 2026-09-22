import { CheckCircle2, FileText, MapPin, AlertTriangle } from "lucide-react";

const TYPE_CONFIG = {
  success: {
    Icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  info: {
    Icon: FileText,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-900/30",
  },
  warning: {
    Icon: MapPin,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-900/30",
  },
  error: {
    Icon: AlertTriangle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50 dark:bg-red-900/30",
  },
};

/**
 * @param {{ activities: Array<{ id, type, title, description, time }> }} props
 */
export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-4">Recent Activity</h2>

      <ul className="flex flex-col gap-3">
        {activities.map((item) => (
          <ActivityItem key={item.id} {...item} />
        ))}
      </ul>
    </div>
  );
}

function ActivityItem({ type, title, description, time }) {
  const { Icon, iconClass, bgClass } = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  return (
    <li className="flex items-start gap-3">
      {/* Icon */}
      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon size={14} className={iconClass} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 leading-tight">{title}</p>
        <p className="text-[13px] text-gray-400 dark:text-slate-400 mt-0.5 truncate">{description}</p>
      </div>

      {/* Time */}
      <span className="text-[13px] text-gray-400 dark:text-slate-500 shrink-0 mt-0.5">{time}</span>
    </li>
  );
}