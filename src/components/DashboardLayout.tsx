import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import {
  LayoutDashboard,
  Users,
  Utensils,
  ClipboardList,
  CalendarDays,
  Calendar,
  UserCog,
  UsersRound,
  Settings,
  CreditCard,
  Shield,
  LogOut,
  Search,
  Sun,
  Moon,
  Menu,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["super_admin", "admin", "provider"],
  },
  {
    label: "Providers",
    path: "/providers",
    icon: <UsersRound size={20} />,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Client Management",
    path: "/clients",
    icon: <Users size={20} />,
    roles: ["super_admin", "admin", "provider"],
  },
  {
    label: "Diet Management",
    path: "/diet-management",
    icon: <Utensils size={20} />,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Diet Plans",
    path: "/diet-plans",
    icon: <Utensils size={20} />,
    roles: ["provider"],
  },
  {
    label: "Prescriptions",
    path: "/prescriptions",
    icon: <ClipboardList size={20} />,
    roles: ["super_admin", "admin", "provider"],
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: <CalendarDays size={20} />,
    roles: ["provider"],
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: <Calendar size={20} />,
    roles: ["provider"],
  },
  {
    label: "Messages",
    path: "/messages",
    icon: <MessageSquare size={20} />,
    roles: ["super_admin", "admin", "provider"],
  },
  {
    label: "Subscriptions",
    path: "/subscriptions",
    icon: <CreditCard size={20} />,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Admin Management",
    path: "/admin-management",
    icon: <Shield size={20} />,
    roles: ["super_admin"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings size={20} />,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Account Manager",
    path: "/account",
    icon: <UserCog size={20} />,
    roles: ["super_admin", "admin", "provider"],
  },
];

const DashboardLayout = () => {
  const { role, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (role) {
      setSidebarOpen(true);
      setLabelsVisible(true);
    }
  }, [role]);

  const filteredNav = navItems.filter(
    (item) => role && item.roles.includes(role),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    setTimeout(() => setLabelsVisible(true), 200);
  };

  const closeSidebar = () => {
    setLabelsVisible(false);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - on desktop: collapsed (icons only) or expanded */}
      {/* On mobile: hidden or full overlay */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 h-screen flex flex-col bg-sidebar transition-all duration-200
        ${
          sidebarOpen
            ? "w-56 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-16"
        }
        lg:static
      `}
      >
        {/* Logo area - only show when expanded */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          {labelsVisible ? (
            <>
              <span className="font-display text-xl font-bold text-sidebar-foreground transition-all duration-200 ease-in-out">
                Diet<span className="text-accent">Padi</span>
              </span>
              <button
                onClick={closeSidebar}
                className="text-sidebar-foreground opacity-60 hover:opacity-100"
              >
                <Menu size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={openSidebar}
              className="hidden lg:flex w-full items-center justify-center text-sidebar-foreground transition-all duration-200 ease-in-out opacity-60 hover:opacity-100"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav flex-1 space-y-1 overflow-y-auto px-2">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${!sidebarOpen ? "lg:justify-center lg:px-0" : ""}`}
              >
                {item.icon}
                {labelsVisible && (
                  <span className="transition-all duration-200 ease-in-out">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2">
          <button
            onClick={signOut}
            title={!sidebarOpen ? "Logout" : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-foreground/20 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent ${!sidebarOpen ? "lg:px-0" : ""}`}
          >
            <LogOut size={18} />
            {labelsVisible && (
              <span className="transition-all duration-200 ease-in-out">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <NotificationsPanel />
            <button
              onClick={handleRefresh}
              title="Refresh data"
              className={`rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => navigate("/account")}
              className="flex items-center gap-2"
            >
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                {profile?.full_name?.charAt(0) || "U"}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
