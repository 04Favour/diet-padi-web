import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  User,
  CalendarDays,
  ChevronDown,
  Grid,
  List,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProviders } from "@/hooks/useProviders";
import {
  CreateProviderModal,
  EditProviderModal,
  ProviderDetailsModal,
  SendMessageModal,
} from "@/modals";
import { ProviderRow, downloadProviderCsv } from "@/components/provider-utils";
import { ProvidersListView } from "@/components/ProvidersListView";
import { ProvidersGridView } from "@/components/ProvidersGridView";

const Providers = () => {
  const navigate = useNavigate();
  const { providers, loading, refetch } = useProviders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [modal, setModal] = useState<
    | { type: "view"; provider: ProviderRow }
    | { type: "edit"; provider: ProviderRow }
    | { type: "message"; provider: ProviderRow }
    | { type: "create" }
    | null
  >(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = providers.filter((provider) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      provider.name.toLowerCase().includes(search) ||
      provider.specialty.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All Statuses" ||
      provider.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalProviders = providers.length;
  const activeProviders = providers.filter(
    (provider) => provider.status.toLowerCase() === "active",
  ).length;
  const totalAppointments = providers.reduce(
    (sum, provider) => sum + provider.appointmentCount,
    0,
  );

  const handleSaveEdit = async (updated: ProviderRow) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updated.name,
          specialty: updated.specialty,
          phone: updated.phone === "N/A" ? null : updated.phone,
          clinic: updated.location === "N/A" ? null : updated.location,
          license_number:
            updated.licenseNumber === "N/A" ? null : updated.licenseNumber,
        })
        .eq("user_id", updated.user_id);

      if (error) throw error;
      toast({ title: "Provider updated" });
      setModal(null);
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Update failed",
        description: message || "Could not update provider.",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (provider: ProviderRow) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("user_id", provider.user_id);

      if (error) throw error;
      toast({ title: `${provider.name} suspended` });
      setModal(null);
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Suspend failed",
        description: message || "Could not suspend provider.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (provider: ProviderRow) => {
    try {
      const [{ error: roleError }, { error: profileError }] = await Promise.all(
        [
          supabase.from("user_roles").delete().eq("user_id", provider.user_id),
          supabase.from("profiles").delete().eq("user_id", provider.user_id),
        ],
      );

      if (roleError || profileError) throw roleError || profileError;
      toast({ title: `${provider.name} deleted` });
      setModal(null);
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Delete failed",
        description: message || "Could not delete provider.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProvider = async (data: Record<string, string>) => {
    setCreateLoading(true);

    try {
      const response = await supabase.functions.invoke("create-provider", {
        body: {
          email: data.email,
          password: data.password,
          full_name:
            `${data.title ? `${data.title}. ` : ""}${data.firstName} ${data.lastName}`.trim(),
          specialty: data.specialty,
          phone: data.phone,
          license_number: data.licenseNumber,
          clinic: data.clinic,
          role: "provider",
        },
      });

      if (response.error) throw new Error(response.error.message);
      toast({ title: "Provider created" });
      setModal(null);
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Creation failed",
        description: message || "Could not create provider.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Provider Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/appointments")}
          className="relative border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          Appointment Requests
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setModal({ type: "create" })}
          className="border border-primary text-primary rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/5 flex items-center gap-2"
        >
          <Plus size={16} /> Create Provider
        </button>
        <button
          onClick={() => navigate("/appointments")}
          className="bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[hsl(88,56%,30%)] flex items-center gap-2"
        >
          <CalendarDays size={16} /> Manage Appointments
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Providers",
            value: totalProviders,
            icon: <User size={20} className="text-orange-500" />,
          },
          {
            label: "Active Providers",
            value: activeProviders,
            icon: <User size={20} className="text-orange-500" />,
          },
          {
            label: "Total Appointments",
            value: totalAppointments,
            icon: <CalendarDays size={20} className="text-orange-500" />,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
            {card.icon}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-col sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white appearance-none pr-8 cursor-pointer"
          >
            {["All Statuses", "Active", "Inactive", "Pending", "Suspended"].map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ),
            )}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            aria-label="Switch to list view"
            className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"} rounded-l-lg transition`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            aria-label="Switch to grid view"
            className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"} rounded-r-lg transition`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <ProvidersListView
          filtered={filtered}
          loading={loading}
          onView={(provider) => setModal({ type: "view", provider })}
          onEdit={(provider) => setModal({ type: "edit", provider })}
        />
      ) : (
        <ProvidersGridView
          filtered={filtered}
          loading={loading}
          onView={(provider) => setModal({ type: "view", provider })}
          onEdit={(provider) => setModal({ type: "edit", provider })}
        />
      )}

      {modal?.type === "view" && modal.provider && (
        <ProviderDetailsModal
          provider={modal.provider}
          onClose={() => setModal(null)}
          onEdit={(provider) => setModal({ type: "edit", provider })}
          onMessage={(provider) => setModal({ type: "message", provider })}
          onSuspend={handleSuspend}
          onDelete={handleDelete}
          onExport={downloadProviderCsv}
        />
      )}
      {modal?.type === "edit" && modal.provider && (
        <EditProviderModal
          provider={modal.provider}
          onClose={() => setModal(null)}
          onSave={handleSaveEdit}
        />
      )}
      {modal?.type === "message" && modal.provider && (
        <SendMessageModal
          provider={modal.provider}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "create" && (
        <CreateProviderModal
          onClose={() => setModal(null)}
          onCreate={handleCreateProvider}
          loading={createLoading}
        />
      )}
    </div>
  );
};

export default Providers;
