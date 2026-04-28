import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Plus,
  Utensils,
  Edit,
  Trash2,
  X,
  Grid,
  List,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  CreateDietPlanModal,
  DietPlanDetailsModal,
  EditDietPlanModal,
} from "@/modals";

interface DietPlan {
  id: string;
  plan_name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  provider_id: string;
  client_id: string | null;
  created_at: string;
  updated_at?: string;
  meals: unknown;
  clients?: { full_name: string } | null;
  provider_profile?: { full_name: string } | null;
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; className: string }
> = {
  Approved: {
    icon: <CheckCircle size={14} />,
    className: "bg-success/10 text-success",
  },
  Active: {
    icon: <CheckCircle size={14} />,
    className: "bg-success/10 text-success",
  },
  Pending: {
    icon: <Clock size={14} />,
    className: "bg-warning/10 text-warning",
  },
  Rejected: {
    icon: <XCircle size={14} />,
    className: "bg-destructive/10 text-destructive",
  },
  Draft: {
    icon: <Clock size={14} />,
    className: "bg-muted text-muted-foreground",
  },
  Cancelled: {
    icon: <XCircle size={14} />,
    className: "bg-destructive/10 text-destructive",
  },
  Completed: {
    icon: <CheckCircle size={14} />,
    className: "bg-muted text-muted-foreground",
  },
};

const DietManagement = () => {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [providers, setProviders] = useState<
    { user_id: string; full_name: string }[]
  >([]);

  const fetchPlans = async () => {
    const [planRes, clientRes, providerRoleRes] = await Promise.all([
      supabase
        .from("diet_plans")
        .select("*, clients(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name"),
      supabase.from("user_roles").select("user_id").eq("role", "provider"),
    ]);

    if (planRes.data) {
      const providerIds = [...new Set(planRes.data.map((d) => d.provider_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", providerIds);
      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.full_name]) || [],
      );
      setPlans(
        planRes.data.map((d) => ({
          ...d,
          provider_profile: {
            full_name: profileMap.get(d.provider_id) || "Unknown",
          },
        })),
      );
    }
    if (clientRes.data) setClients(clientRes.data);

    if (providerRoleRes.data) {
      const pIds = providerRoleRes.data.map((r) => r.user_id);
      const { data: pProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", pIds);
      if (pProfiles) setProviders(pProfiles);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = plans.filter((p) => {
    const matchSearch =
      p.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clients?.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (p.provider_profile?.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchFilter = filter === "All" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: plans.length,
    active: plans.filter(
      (p) => p.status === "Active" || p.status === "Approved",
    ).length,
    drafts: plans.filter((p) => p.status === "Draft" || p.status === "Pending")
      .length,
    cancelled: plans.filter(
      (p) => p.status === "Cancelled" || p.status === "Rejected",
    ).length,
  };

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("diet_plans")
      .update({ status })
      .eq("id", id);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: `Diet plan ${status.toLowerCase()}` });
      const plan = plans.find((p) => p.id === id);
      if (plan) {
        await supabase.from("notifications").insert({
          user_id: plan.provider_id,
          title: `Diet Plan ${status}`,
          message: `Your diet plan "${plan.plan_name}" has been ${status.toLowerCase()}.`,
          type:
            status === "Approved" || status === "Active"
              ? "success"
              : "warning",
        });
      }
      fetchPlans();
      if (selectedPlan?.id === id)
        setSelectedPlan((prev) => (prev ? { ...prev, status } : null));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("diet_plans").delete().eq("id", id);
    toast({ title: "Diet plan deleted" });
    if (selectedPlan?.id === id) setSelectedPlan(null);
    fetchPlans();
  };

  const handleCreateTemplate = async (data: Record<string, string>) => {
    if (!user) return;
    setCreateLoading(true);
    const client = clients.find((c) => c.full_name === data.client);
    const provider = providers.find((p) => p.full_name === data.provider);
    const { error } = await supabase.from("diet_plans").insert({
      plan_name: data.plan_name,
      client_id: client?.id || null,
      provider_id: provider?.user_id || user.id,
      description: data.notes || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: "Active",
      meals: data.calories
        ? JSON.stringify({ calories: data.calories, goal: data.goal })
        : null,
    });
    setCreateLoading(false);
    if (error) throw error;
    toast({ title: "Diet plan created!" });
    fetchPlans();
  };

  const planTypes = [
    "Weight Loss",
    "Blood Sugar Control",
    "Keto",
    "Heart Health",
    "Maintenance",
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary">
            Diet Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of all diet plans across providers
          </p>
        </div>
        {role === "super_admin" && (
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus size={18} /> Create Diet Template
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Plans</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.drafts}</p>
          <p className="text-xs text-muted-foreground">Drafts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {stats.cancelled}
          </p>
          <p className="text-xs text-muted-foreground">Cancelled</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {[
            "All",
            "Active",
            "Approved",
            "Pending",
            "Draft",
            "Cancelled",
            "Rejected",
          ].map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            aria-label="Switch to list view"
            className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"} rounded-l-lg`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            aria-label="Switch to grid view"
            className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"} rounded-r-lg`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Plan Name
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">
                  Client
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                  Provider
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                  Calories
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                  Start Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No diet plans found
                  </td>
                </tr>
              ) : (
                filtered.map((plan) => {
                  const config =
                    statusConfig[plan.status] || statusConfig["Pending"];
                  const calories =
                    plan.meals &&
                    typeof plan.meals === "object" &&
                    !Array.isArray(plan.meals)
                      ? String(
                          (plan.meals as Record<string, unknown>).calories ||
                            "—",
                        )
                      : "—";
                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {plan.plan_name}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {plan.clients?.full_name || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {plan.provider_profile?.full_name}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {calories}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                        >
                          {config.icon} {plan.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                        {plan.start_date || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedPlan(plan)}
                            title="View plan details"
                            aria-label="View plan details"
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setEditingPlan(plan)}
                            title="Edit plan"
                            aria-label="Edit plan"
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <Edit size={16} />
                          </button>
                          {plan.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(plan.id, "Approved")
                                }
                                title="Approve plan"
                                aria-label="Approve plan"
                                disabled={loading}
                                className="rounded p-1.5 text-success hover:bg-success/10"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(plan.id, "Rejected")
                                }
                                title="Reject plan"
                                aria-label="Reject plan"
                                disabled={loading}
                                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {plan.status !== "Cancelled" &&
                            plan.status !== "Rejected" && (
                              <button
                                onClick={() =>
                                  updateStatus(plan.id, "Cancelled")
                                }
                                className="rounded p-1.5 text-warning hover:bg-warning/10"
                                title="Cancel"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          <button
                            onClick={() => handleDelete(plan.id)}
                            title="Delete plan"
                            aria-label="Delete plan"
                            className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No diet plans found
            </div>
          ) : (
            filtered.map((plan) => {
              const config =
                statusConfig[plan.status] || statusConfig["Pending"];
              const calories =
                plan.meals &&
                typeof plan.meals === "object" &&
                !Array.isArray(plan.meals)
                  ? String(
                      (plan.meals as Record<string, unknown>).calories || "—",
                    )
                  : "—";
              return (
                <div
                  key={plan.id}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {plan.plan_name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                    >
                      {config.icon} {plan.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client</span>
                      <span className="text-foreground">
                        {plan.clients?.full_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="text-foreground">
                        {plan.provider_profile?.full_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calories</span>
                      <span className="text-foreground">{calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start</span>
                      <span className="text-foreground">
                        {plan.start_date || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      title="View plan details"
                      aria-label="View plan details"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      title="Edit plan"
                      aria-label="Edit plan"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <Edit size={16} />
                    </button>
                    {plan.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(plan.id, "Approved")}
                          title="Approve plan"
                          aria-label="Approve plan"
                          disabled={loading}
                          className="rounded p-1.5 text-success hover:bg-success/10"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => updateStatus(plan.id, "Rejected")}
                          title="Reject plan"
                          aria-label="Reject plan"
                          disabled={loading}
                          className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(plan.id)}
                      title="Delete plan"
                      aria-label="Delete plan"
                      className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlan && (
        <DietPlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onApprove={() => {
            updateStatus(selectedPlan.id, "Approved");
            setSelectedPlan(null);
          }}
          onReject={() => {
            updateStatus(selectedPlan.id, "Rejected");
            setSelectedPlan(null);
          }}
        />
      )}

      <CreateDietPlanModal
        open={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onCreate={handleCreateTemplate}
        loading={createLoading}
        clients={clients}
        providers={providers}
        planTypes={planTypes}
      />

      <EditDietPlanModal
        open={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        onSave={handleCreateTemplate}
        loading={createLoading}
        clients={clients}
        providers={providers}
        planTypes={planTypes}
      />
    </div>
  );
};

export default DietManagement;
