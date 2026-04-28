import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Utensils,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

type Period = "day" | "week" | "month";

const StatCard = ({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
      <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </span>
    </div>
    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-foreground">
      {value}
    </p>
    <div
      className={`mt-1 flex items-center gap-1 text-xs sm:text-sm ${positive ? "text-success" : "text-destructive"}`}
    >
      {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {change}
    </div>
  </div>
);

const getDateRange = (period: Period) => {
  const now = new Date();
  const start = new Date();
  if (period === "day") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(now.getDate() - 7);
  else start.setMonth(now.getMonth() - 1);
  return start.toISOString();
};

const Dashboard = () => {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const name =
    profile?.full_name ||
    (role === "super_admin"
      ? "Super Admin"
      : role === "admin"
        ? "Admin"
        : "Provider");
  const [period, setPeriod] = useState<Period>("day");
  const [stats, setStats] = useState({
    clients: 0,
    dietPlans: 0,
    prescriptions: 0,
    appointments: 0,
    providers: 0,
  });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingProviders, setPendingProviders] = useState(0);
  const [pendingDietRequests, setPendingDietRequests] = useState(0);

  useEffect(() => {
    if (!user) return;
    const since = getDateRange(period);

    const fetchData = async () => {
      if (role === "provider") {
        const [clientRes, dietRes, prescRes, apptRes, recentCRes, upApptRes] =
          await Promise.all([
            supabase
              .from("clients")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("diet_plans")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("prescriptions")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("appointments")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("clients")
              .select("full_name, condition, created_at")
              .order("created_at", { ascending: false })
              .limit(4),
            supabase
              .from("appointments")
              .select("*, clients(full_name)")
              .gte("date", new Date().toISOString().split("T")[0])
              .order("date", { ascending: true })
              .order("time", { ascending: true })
              .limit(4),
          ]);
        setStats({
          clients: clientRes.count || 0,
          dietPlans: dietRes.count || 0,
          prescriptions: prescRes.count || 0,
          appointments: apptRes.count || 0,
          providers: 0,
        });
        setRecentClients(recentCRes.data || []);
        setUpcomingAppts(upApptRes.data || []);
      } else {
        const [clientRes, provRes, apptRes, dietPendRes, notifRes] =
          await Promise.all([
            supabase
              .from("clients")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("user_roles")
              .select("id", { count: "exact", head: true })
              .eq("role", "provider"),
            supabase
              .from("appointments")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since),
            supabase
              .from("diet_plans")
              .select("id", { count: "exact", head: true })
              .eq("status", "Pending"),
            supabase
              .from("notifications")
              .select("id, title, message, created_at, type")
              .order("created_at", { ascending: false })
              .limit(5),
          ]);
        setStats({
          clients: clientRes.count || 0,
          dietPlans: 0,
          prescriptions: 0,
          appointments: apptRes.count || 0,
          providers: provRes.count || 0,
        });
        setPendingDietRequests(dietPendRes.count || 0);
        setRecentActivities(notifRes.data || []);
        setPendingProviders(0);
      }
    };
    fetchData();
  }, [user, role, period]);

  const PeriodButtons = () => (
    <div className="flex gap-1">
      {(["day", "week", "month"] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`rounded-lg border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium capitalize transition-colors ${period === p ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );

  if (role === "provider") {
    return (
      <div>
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-primary">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {name}
            </p>
          </div>
          <PeriodButtons />
        </div>

        <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatCard
            title="Total Clients"
            value={String(stats.clients)}
            change={`This ${period}`}
            positive
            icon={<Users size={20} />}
          />
          <StatCard
            title="Diet Plans"
            value={String(stats.dietPlans)}
            change={`This ${period}`}
            positive
            icon={<Utensils size={20} />}
          />
          <StatCard
            title="Prescriptions"
            value={String(stats.prescriptions)}
            change={`This ${period}`}
            positive
            icon={<ClipboardList size={20} />}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Recent Clients
              </h2>
              <button
                onClick={() => navigate("/clients")}
                className="text-sm font-medium text-primary"
              >
                View All
              </button>
            </div>
            {recentClients.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No recent clients
              </p>
            ) : (
              recentClients.map((client, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {client.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {client.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.condition || "No condition"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-primary">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Upcoming Appointments
              </h2>
              <button
                onClick={() => navigate("/appointments")}
                className="text-sm font-medium text-primary"
              >
                View All
              </button>
            </div>
            {upcomingAppts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming appointments
              </p>
            ) : (
              upcomingAppts.map((apt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {apt.clients?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.type}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-medium ${apt.mode === "Virtual" ? "text-accent" : "text-success"}`}
                    >
                      ● {apt.mode}
                    </p>
                    <p className="text-xs text-primary">
                      {apt.date} {apt.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
            Quick Action
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            {[
              {
                label: "Schedule",
                desc: "Manage Appointment",
                icon: <CalendarDays size={24} className="text-accent" />,
                path: "/appointments",
              },
              {
                label: "Diet Plan",
                desc: "Create a Plan",
                icon: <Utensils size={24} className="text-accent" />,
                path: "/diet-plans",
              },
              {
                label: "Health Shop",
                desc: "Browse Products",
                icon: <ShoppingBag size={24} className="text-accent" />,
                path: "/dashboard",
              },
              {
                label: "Prescriptions",
                desc: "Create Prescription",
                icon: <ClipboardList size={24} className="text-accent" />,
                path: "/prescriptions",
              },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-4 sm:p-5 transition-colors hover:border-primary/30"
              >
                {action.icon}
                <p className="mt-2 text-xs sm:text-sm font-semibold text-foreground">
                  {action.label}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {action.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Super Admin / Admin dashboard
  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-primary">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <PeriodButtons />
      </div>

      <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="₦0"
          change={`This ${period}`}
          positive
          icon={<DollarSign size={20} />}
        />
        <StatCard
          title="Active Clients"
          value={String(stats.clients)}
          change={`This ${period}`}
          positive
          icon={<Users size={20} />}
        />
        <StatCard
          title="Providers"
          value={String(stats.providers)}
          change={`This ${period}`}
          positive
          icon={<Users size={20} />}
        />
        <StatCard
          title="Appointments"
          value={String(stats.appointments)}
          change={`This ${period}`}
          positive
          icon={<CalendarDays size={20} />}
        />
      </div>

      <div className="mb-6 sm:mb-8">
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">
          Pending Actions
        </h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/providers")}
            className="relative rounded-lg border border-border bg-card px-4 sm:px-5 py-2.5 sm:py-3 text-sm hover:bg-muted transition-colors"
          >
            <span className="absolute -right-2 -top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-destructive text-[10px] sm:text-xs font-bold text-destructive-foreground">
              {pendingProviders}
            </span>
            Provider Approval
          </button>
          <button
            onClick={() => navigate("/diet-management")}
            className="relative rounded-lg border border-border bg-card px-4 sm:px-5 py-2.5 sm:py-3 text-sm hover:bg-muted transition-colors"
          >
            <span className="absolute -right-2 -top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-destructive text-[10px] sm:text-xs font-bold text-destructive-foreground">
              {pendingDietRequests}
            </span>
            Diet Plan Requests
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Recent Activities
            </h2>
            <button
              onClick={() => navigate("/messages")}
              className="text-sm font-medium text-primary"
            >
              View All
            </button>
          </div>
          {recentActivities.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recent activities
            </p>
          ) : (
            recentActivities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border py-3 last:border-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Users size={14} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    {activity.title}: {activity.message}
                  </p>
                  <p className="text-xs text-primary">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Top Providers
            </h2>
            <button
              onClick={() => navigate("/providers")}
              className="text-sm font-medium text-primary"
            >
              View All
            </button>
          </div>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Provider performance data coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
