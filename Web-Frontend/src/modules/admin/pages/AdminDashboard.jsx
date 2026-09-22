import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import ActiveProjects from "../components/ActiveProjects";
import useDashboard from "../hooks/useDashboard";

// ─────────────────────────────────────────────────────────────
// Helper Mappers (Safe transformation so UI doesn't break)
// ─────────────────────────────────────────────────────────────

const mapStats = (data = {}) => {
  return [
    {
      id: "active-projects",
      label: "Active Projects",
      value: data?.projects?.active ?? "0",
      sub: "Ongoing",
      badge: {
        text: `${data?.projects?.newThisWeek ?? 0} This Week`,
        color: "green",
      },
      icon: "grid",
      iconColor: "blue",
    },
    {
      id: "attendance",
      label: "Attendance Today",
      value: data?.attendance?.present ?? "0",
      sub: `of ${data?.attendance?.total ?? 0}`,
      badge: {
        text: `${data?.attendance?.percentage ?? 0}%`,
        color: "green",
      },
      icon: "users",
      iconColor: "green",
    },
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      value: data?.approvals?.pending ?? "0",
      sub: "Budget + Timeline",
      badge: {
        text: "Needs Review",
        color: "red",
      },
      icon: "clipboard",
      iconColor: "orange",
    },
    {
      id: "inventory",
      label: "Inventory Usage",
      value: data?.inventory?.usage ?? "₹0",
      sub: "This month",
      badge: {
        text: data?.inventory?.status ?? "Normal",
        color: data?.inventory?.status === "Over Budget" ? "red" : "green",
      },
      icon: "box",
      iconColor: "purple",
    },
  ];
};

const mapActivities = (data = []) => {
  return data.map((item, index) => ({
    id: item.id || index,
    type: item.type || "info",
    title: item.title || "Activity",
    description: item.description || "",
    time: item.time || "",
  }));
};

const mapProjects = (data = []) => {
  return data.map((project) => ({
    id: project.id,
    name: project.name,
    location: project.location,
    status: project.status || "Ongoing",
    progress: project.progress ?? 0,
    daysLeft: project.daysLeft ?? 0,
    statusColor:
      project.status === "On Hold"
        ? "yellow"
        : project.status === "Completed"
        ? "green"
        : "green",
    barColor:
      project.status === "On Hold"
        ? "yellow"
        : project.status === "Completed"
        ? "green"
        : "blue",
  }));
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { stats, activities, projects, loading } = useDashboard();

  const mappedStats = mapStats(stats);
  const mappedActivities = mapActivities(activities);
  const mappedProjects = mapProjects(projects);

  return (
    <div className="w-full">
      <main className="p-6">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {mappedStats.map((stat) => (
                <StatCard key={stat.id} {...stat} />
              ))}
            </section>

            {/* Bottom Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ActivityFeed activities={mappedActivities} />
              <ActiveProjects projects={mappedProjects} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton Loader (UNCHANGED)
// ─────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}