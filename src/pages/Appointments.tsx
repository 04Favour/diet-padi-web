import { useState, useEffect } from "react";
import {
  Plus,
  Video,
  MapPin,
  Clock,
  Search,
  Phone,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AppointmentRequestsModal, {
  RescheduleAppointmentModal,
} from "@/components/AppointmentRequestsModal";
import { ScheduleAppointmentModal } from "@/modals/ScheduleAppointmentModal";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  type: string;
  mode: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  client_id: string | null;
  clients?: {
    full_name: string;
    gender: string | null;
    date_of_birth: string | null;
  } | null;
}

interface AppointmentRequest {
  id: string;
  client_id: string | null;
  type: string;
  date: string;
  time: string;
  mode: string;
  status: string;
  notes: string | null;
  clients?: {
    full_name: string;
    gender: string | null;
    date_of_birth: string | null;
  } | null;
}

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [activeTab, setActiveTab] = useState<
    "All" | "Upcoming" | "Active" | "Inactive"
  >("All");
  const [showAppointmentRequests, setShowAppointmentRequests] = useState(false);
  const [appointmentRequests, setAppointmentRequests] = useState<
    AppointmentRequest[]
  >([]);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    appointmentId: string;
    clientName: string;
    clientGender: string | null;
    clientAge: number | string;
  } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const [aptRes, clientRes, reqRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, clients(full_name, gender, date_of_birth)")
        .order("date", { ascending: true }),
      supabase.from("clients").select("id, full_name"),
      supabase
        .from("appointments")
        .select("*, clients(full_name, gender, date_of_birth)")
        .eq("status", "Upcoming")
        .order("date", { ascending: true }),
    ]);
    if (aptRes.data) setAppointments(aptRes.data);
    if (clientRes.data) setClients(clientRes.data);
    if (reqRes.data)
      setAppointmentRequests(reqRes.data as AppointmentRequest[]);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (appointments.length > 0 && !selectedAppointment) {
      setSelectedAppointment(appointments[0]);
    }
  }, [appointments, selectedAppointment]);

  const handleCreate = async (data: Record<string, string>) => {
    if (!user) return;
    setLoading(true);
    const client = clients.find((c) => c.full_name === data.client);
    const { error } = await supabase.from("appointments").insert({
      type: data.type,
      mode: data.mode === "In-person" ? "Call" : data.mode || "Virtual",
      date: data.date,
      time: data.time,
      client_id: client?.id || null,
      provider_id: user.id,
      status: "Upcoming",
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Appointment created!" });
      setShowCreate(false);
      fetchData();
    }
  };

  const handleScheduleAppointment = async (data: {
    clientId: string;
    clientName: string;
    appointmentType: "Virtual" | "Call";
    date: string;
    time: string;
    ampm: "AM" | "PM";
    reason: string;
    notes: string;
  }) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      type: data.reason,
      mode: data.appointmentType === "Virtual" ? "Virtual" : "Call",
      date: data.date,
      time: data.time,
      client_id: data.clientId,
      provider_id: user.id,
      status: "Upcoming",
      notes: data.notes || null,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } else {
      toast({ title: "Appointment scheduled successfully!" });
      setShowCreate(false);
      fetchData();
    }
  };

  const handleJoinMeeting = () => {
    if (!selectedAppointment) return;
    toast({
      title: "Joining Meeting",
      description:
        "Opening meeting link for " + selectedAppointment.clients?.full_name,
    });
    // TODO: Integrate with actual meeting service (e.g., Zoom, Google Meet, etc.)
  };

  const handleMessageClient = () => {
    if (!selectedAppointment?.client_id) return;
    navigate("/messages", {
      state: { contactId: selectedAppointment.client_id },
    });
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "Unknown";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getAppointmentReasons = () => {
    const reasons = [
      ...new Set(appointments.map((a) => a.type).filter(Boolean)),
    ] as string[];
    return ["All Reasons", ...reasons];
  };

  const filtered = appointments.filter((a) => {
    const matchSearch =
      (a.clients?.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchReason =
      reasonFilter === "All Reasons" || a.type === reasonFilter;
    const matchStatus =
      statusFilter === "All Statuses" || a.status === statusFilter;
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Upcoming" && a.status === "Upcoming") ||
      (activeTab === "Active" && a.status === "Active") ||
      (activeTab === "Inactive" && a.status === "Inactive");
    return matchSearch && matchReason && matchStatus && matchTab;
  });

  const createFields = [
    {
      name: "client",
      label: "Client",
      type: "select" as const,
      options: clients.map((c) => c.full_name),
      required: true,
    },
    {
      name: "type",
      label: "Appointment Type",
      required: true,
      placeholder: "e.g. General Checkup",
    },
    {
      name: "mode",
      label: "Mode",
      type: "select" as const,
      options: ["Virtual", "Call"],
      required: true,
    },
    { name: "date", label: "Date", type: "date" as const, required: true },
    { name: "time", label: "Time", type: "time" as const, required: true },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-primary/10 text-primary";
      case "Active":
        return "bg-success/10 text-success";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clients")}
            className="rounded-lg p-2 hover:bg-muted text-muted-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">
              Appointment Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage all your appointments
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} /> Schedule Appointment
        </button>
      </div>

      {/* Appointment Requests Tab */}
      <div className="mb-4">
        <div className="relative inline-block">
          <button
            onClick={() => setShowAppointmentRequests(true)}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Appointment Requests
          </button>
          {appointmentRequests.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {appointmentRequests.length}
            </span>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {getAppointmentReasons().map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option>All Statuses</option>
          <option>Upcoming</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-border gap-6 overflow-x-auto">
        {(["All", "Upcoming", "Active", "Inactive"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
          <Clock size={48} className="mb-4 text-muted-foreground opacity-50" />
          <p className="text-base font-semibold text-foreground">
            No appointments
          </p>
          <p className="text-sm text-muted-foreground">
            You don't have any appointments scheduled.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Appointments List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Client Appointments
            </h3>
            {filtered.map((apt) => {
              const age = calculateAge(apt.clients?.date_of_birth || null);
              const initials = getInitials(apt.clients?.full_name || "Unknown");
              const isSelected = selectedAppointment?.id === apt.id;

              return (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`w-full rounded-lg border transition-colors p-4 text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground truncate">
                            {apt.clients?.full_name || "Unknown"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {apt.clients?.gender || "N/A"} | {age} years old
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium flex-shrink-0 ${getStatusColor(
                            apt.status,
                          )}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{apt.type}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {apt.mode === "Virtual" ? (
                            <Video size={12} />
                          ) : (
                            <Phone size={12} />
                          )}
                          {apt.mode === "In-person" || apt.mode === "In-Person"
                            ? "Call"
                            : apt.mode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {apt.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Quick Actions & Details */}
          {selectedAppointment && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Quick Actions
                </h3>
                {selectedAppointment.mode === "Virtual" ? (
                  <button
                    onClick={handleJoinMeeting}
                    className="w-full flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-white hover:bg-success/90"
                  >
                    <Video size={16} />
                    Join Meeting
                  </button>
                ) : (
                  <button
                    onClick={handleJoinMeeting}
                    className="w-full flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-white hover:bg-success/90"
                  >
                    <Phone size={16} />
                    Make the call
                  </button>
                )}
                <button
                  onClick={handleMessageClient}
                  className="w-full flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <MessageSquare size={16} />
                  Message Client
                </button>
                <button
                  onClick={() => {
                    if (!selectedAppointment) return;
                    setRescheduleData({
                      appointmentId: selectedAppointment.id,
                      clientName:
                        selectedAppointment.clients?.full_name || "Unknown",
                      clientGender: selectedAppointment.clients?.gender || null,
                      clientAge: calculateAge(
                        selectedAppointment.clients?.date_of_birth || null,
                      ),
                    });
                    setShowReschedule(true);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <RotateCcw size={16} />
                  Reschedule
                </button>
              </div>

              {/* Selected Appointment Details */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(
                      selectedAppointment.clients?.full_name || "Unknown",
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedAppointment.clients?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculateAge(
                        selectedAppointment.clients?.date_of_birth || null,
                      )}{" "}
                      years old
                    </p>
                  </div>
                  <span className="ml-auto text-xs">
                    {selectedAppointment.date}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Type:
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {selectedAppointment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Date:
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {selectedAppointment.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Time:
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Reason:
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {selectedAppointment.type}
                    </p>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Notes:
                      </p>
                      <p className="text-foreground text-sm">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ScheduleAppointmentModal
        open={showCreate}
        clients={clients}
        onClose={() => setShowCreate(false)}
        onSubmit={handleScheduleAppointment}
        loading={loading}
      />

      {rescheduleData && (
        <RescheduleAppointmentModal
          open={showReschedule}
          onClose={() => {
            setShowReschedule(false);
            setRescheduleData(null);
          }}
          clientName={rescheduleData.clientName}
          clientGender={rescheduleData.clientGender}
          clientAge={rescheduleData.clientAge}
          onSubmit={async (data) => {
            if (!rescheduleData) return;
            setLoading(true);
            const { error } = await supabase
              .from("appointments")
              .update({
                date: data.date,
                time: data.time,
                mode: data.mode,
                type: data.reason,
                status: "Upcoming",
              })
              .eq("id", rescheduleData.appointmentId);
            setLoading(false);
            if (error) {
              toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
              });
            } else {
              toast({ title: "Appointment rescheduled!" });
              setShowReschedule(false);
              setRescheduleData(null);
              fetchData();
            }
          }}
        />
      )}

      <AppointmentRequestsModal
        open={showAppointmentRequests}
        onClose={() => setShowAppointmentRequests(false)}
        requests={appointmentRequests}
        onStatusChange={() => {
          setShowAppointmentRequests(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default Appointments;
