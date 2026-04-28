import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  X,
  Grid,
  List,
  StopCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreateDialog from "@/components/CreateDialog";
import { toast } from "@/hooks/use-toast";
import { EditPrescriptionModal } from "@/modals";

interface Prescription {
  id: string;
  medication: string;
  dosage: string | null;
  instructions: string | null;
  status: string;
  date: string;
  client_id: string | null;
  provider_id: string;
  clients?: { full_name: string } | null;
  provider_profile?: { full_name: string } | null;
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; className: string }
> = {
  Active: {
    icon: <CheckCircle size={14} />,
    className: "bg-success/10 text-success",
  },
  Approved: {
    icon: <CheckCircle size={14} />,
    className: "bg-success/10 text-success",
  },
  "Pending Approval": {
    icon: <Clock size={14} />,
    className: "bg-warning/10 text-warning",
  },
  Rejected: {
    icon: <XCircle size={14} />,
    className: "bg-destructive/10 text-destructive",
  },
  Dispensed: {
    icon: <CheckCircle size={14} />,
    className: "bg-primary/10 text-primary",
  },
  Cancelled: {
    icon: <XCircle size={14} />,
    className: "bg-destructive/10 text-destructive",
  },
  Completed: {
    icon: <CheckCircle size={14} />,
    className: "bg-muted text-muted-foreground",
  },
  Discontinued: {
    icon: <StopCircle size={14} />,
    className: "bg-destructive/10 text-destructive",
  },
};

const Prescriptions = () => {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [rxRes, clientRes] = await Promise.all([
      supabase
        .from("prescriptions")
        .select("*, clients(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name"),
    ]);
    if (rxRes.data) {
      const providerIds = [...new Set(rxRes.data.map((r) => r.provider_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", providerIds);
      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.full_name]) || [],
      );
      setPrescriptions(
        rxRes.data.map((r) => ({
          ...r,
          provider_profile: {
            full_name: profileMap.get(r.provider_id) || "Unknown",
          },
        })),
      );
    }
    if (clientRes.data) setClients(clientRes.data);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = prescriptions.filter((p) => {
    const name = p.clients?.full_name || "";
    const matchSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medication.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === "All" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter((r) => r.status === "Pending Approval")
      .length,
    approved: prescriptions.filter(
      (r) => r.status === "Approved" || r.status === "Active",
    ).length,
    rejected: prescriptions.filter((r) => r.status === "Rejected").length,
  };

  const handleCreate = async (data: Record<string, string>) => {
    if (!user) return;
    setLoading(true);
    const client = clients.find((c) => c.full_name === data.client_id);
    const { error } = await supabase.from("prescriptions").insert({
      medication: data.medication,
      dosage: data.dosage || null,
      instructions:
        [
          data.instructions,
          data.side_effects ? `Side Effects: ${data.side_effects}` : "",
        ]
          .filter(Boolean)
          .join("\n") || null,
      client_id: client?.id || null,
      provider_id: user.id,
    });
    setLoading(false);
    if (error) throw error;
    // Notify super admin
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["super_admin"]);
    if (adminRoles) {
      await supabase.from("notifications").insert(
        adminRoles.map((r) => ({
          user_id: r.user_id,
          title: "New Prescription for Review",
          message: `A provider submitted a prescription (${data.medication}) for ${client?.full_name || "a client"}.`,
          type: "info",
        })),
      );
    }
    fetchData();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("prescriptions")
      .update({ status: newStatus })
      .eq("id", id);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: `Status updated to ${newStatus}` });
      fetchData();
      if (selectedRx?.id === id)
        setSelectedRx((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("id", id);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Prescription deleted" });
      if (selectedRx?.id === id) setSelectedRx(null);
      fetchData();
    }
  };

  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isProvider = role === "provider";

  const createFields = [
    {
      name: "client_id",
      label: "Client",
      type: "select" as const,
      options: clients.map((c) => c.full_name),
      required: true,
    },
    { name: "medication", label: "Medication", required: true },
    { name: "dosage", label: "Dosage" },
    { name: "instructions", label: "Instructions", type: "textarea" as const },
    {
      name: "side_effects",
      label: "Possible Side Effects",
      type: "textarea" as const,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            Prescriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Review and manage all prescriptions"
              : "Create and manage prescriptions for your clients"}
          </p>
        </div>
        {isProvider && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus size={18} /> New Prescription
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {stats.rejected}
          </p>
          <p className="text-xs text-muted-foreground">Rejected</p>
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
            placeholder="Search prescriptions..."
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
            "Pending Approval",
            "Approved",
            "Active",
            "Rejected",
            "Dispensed",
            "Cancelled",
            "Completed",
            "Discontinued",
          ].map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"} rounded-l-lg`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
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
                {isSuperAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    ID
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Client
                </th>
                {isSuperAdmin && (
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                    Provider
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Medication
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                  Date
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
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                filtered.map((rx, index) => {
                  const config = statusConfig[rx.status] || {
                    icon: <AlertCircle size={14} />,
                    className: "bg-muted text-muted-foreground",
                  };
                  return (
                    <tr
                      key={rx.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          RX-{String(index + 1).padStart(3, "0")}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          {rx.clients?.full_name || "—"}
                        </p>
                      </td>
                      {isSuperAdmin && (
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                          {rx.provider_profile?.full_name}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {rx.medication}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                        >
                          {config.icon} {rx.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                        {rx.date}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRx(rx)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <Eye size={16} />
                          </button>
                          {isSuperAdmin && rx.status === "Pending Approval" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(rx.id, "Approved")
                                }
                                className="rounded p-1.5 text-success hover:bg-success/10"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(rx.id, "Rejected")
                                }
                                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {isProvider &&
                            (rx.status === "Active" ||
                              rx.status === "Approved") && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(rx.id, "Completed")
                                  }
                                  title="Mark Complete"
                                  className="rounded p-1.5 text-success hover:bg-success/10"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(rx.id, "Discontinued")
                                  }
                                  title="Discontinue"
                                  className="rounded p-1.5 text-warning hover:bg-warning/10"
                                >
                                  <StopCircle size={16} />
                                </button>
                              </>
                            )}
                          <button
                            onClick={() => setEditingRx(rx)}
                            title="Edit prescription"
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rx.id)}
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
              No prescriptions found
            </div>
          ) : (
            filtered.map((rx) => {
              const config = statusConfig[rx.status] || {
                icon: <AlertCircle size={14} />,
                className: "bg-muted text-muted-foreground",
              };
              return (
                <div
                  key={rx.id}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">
                      {rx.clients?.full_name || "—"}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                    >
                      {config.icon} {rx.status}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {rx.medication}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rx.dosage || "No dosage"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rx.date}
                  </p>
                  {rx.provider_profile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      By: {rx.provider_profile.full_name}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1">
                    <button
                      onClick={() => setSelectedRx(rx)}
                      title="View prescription details"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditingRx(rx)}
                      title="Edit prescription"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <Edit size={16} />
                    </button>
                    {isProvider &&
                      (rx.status === "Active" || rx.status === "Approved") && (
                        <button
                          onClick={() => handleStatusChange(rx.id, "Completed")}
                          title="Mark Complete"
                          className="rounded p-1.5 text-success hover:bg-success/10"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    <button
                      onClick={() => handleDelete(rx.id)}
                      title="Delete prescription"
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
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Prescription Details
              </h3>
              <button onClick={() => setSelectedRx(null)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedRx.clients?.full_name || "—"}
                </p>
              </div>
              {selectedRx.provider_profile && (
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedRx.provider_profile.full_name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Medication</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedRx.medication}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dosage</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedRx.dosage || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedRx.date}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${(statusConfig[selectedRx.status] || statusConfig["Active"]).className}`}
                >
                  {
                    (statusConfig[selectedRx.status] || statusConfig["Active"])
                      .icon
                  }{" "}
                  {selectedRx.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Instructions & Side Effects
                </p>
                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-line">
                  {selectedRx.instructions || "No instructions"}
                </p>
              </div>
            </div>

            {/* Provider Actions */}
            {isProvider &&
              (selectedRx.status === "Active" ||
                selectedRx.status === "Approved") && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedRx.id, "Completed")
                    }
                    className="flex-1 rounded-lg border border-success/30 py-2 text-xs font-medium text-success hover:bg-success/10"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedRx.id, "Discontinued")
                    }
                    className="flex-1 rounded-lg border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    Discontinue
                  </button>
                </div>
              )}

            {/* Super Admin Actions */}
            {isSuperAdmin && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Approved",
                    "Pending Approval",
                    "Dispensed",
                    "Cancelled",
                    "Rejected",
                    "Completed",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedRx.id, s)}
                      disabled={selectedRx.status === s}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30 ${selectedRx.status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedRx(null)}
              className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <CreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Prescription"
        fields={createFields}
        onSubmit={handleCreate}
        loading={loading}
        successMessage="Prescription Created Successfully!"
      />

      <EditPrescriptionModal
        open={!!editingRx}
        onClose={() => setEditingRx(null)}
        prescription={editingRx}
        loading={loading}
        clients={clients}
        medications={[]}
      />
    </div>
  );
};

export default Prescriptions;
