import {
  LayoutGrid,
  Users,
  ClipboardList,
  Package,
} from "lucide-react";

const ICON_MAP = {
  grid: LayoutGrid,
  users: Users,
  clipboard: ClipboardList,
  box: Package,
};

const ICON_COLORS = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
};

const BADGE_COLORS = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  yellow: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {string} props.sub
 * @param {{ text: string, color: 'green' | 'red' | 'yellow' }} props.badge
 * @param {'grid' | 'users' | 'clipboard' | 'box'} props.icon
 * @param {'blue' | 'green' | 'orange' | 'purple'} props.iconColor
 */
export default function StatCard({ label, value, sub, badge, icon, iconColor }) {
  const Icon = ICON_MAP[icon] ?? LayoutGrid;
  const iconClass = ICON_COLORS[iconColor] ?? ICON_COLORS.blue;
  const badgeClass = BADGE_COLORS[badge?.color] ?? BADGE_COLORS.green;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon size={16} />
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-none">{value}</p>

      {/* Footer: sub label + badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-400 dark:text-slate-500">{sub}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}