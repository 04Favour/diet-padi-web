import { useState } from "react";
import {
  X,
  Check,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface AppointmentRequestsModalProps {
  open: boolean;
  onClose: () => void;
  requests: AppointmentRequest[];
  onStatusChange?: () => void;
}

interface RescheduleData {
  appointmentId: string;
  clientName: string;
  clientGender: string | null;
  clientAge: number | string;
}

const AppointmentRequestsModal = ({
  open,
  onClose,
  requests,
  onStatusChange,
}: AppointmentRequestsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData | null>(
    null,
  );

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

  const handleAction = async (
    id: string,
    action: "Accepted" | "Declined" | "Rescheduled",
  ) => {
    setProcessingId(id);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: action })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: `Appointment ${action.toLowerCase()}`,
        description: `Appointment has been ${action.toLowerCase()}.`,
      });
      onStatusChange?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const handleRescheduleClick = (request: AppointmentRequest) => {
    const age = calculateAge(request.clients?.date_of_birth || null);
    setRescheduleData({
      appointmentId: request.id,
      clientName: request.clients?.full_name || "Unknown",
      clientGender: request.clients?.gender || null,
      clientAge: age,
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (data: {
    date: string;
    time: string;
    mode: string;
    reason: string;
  }) => {
    if (!rescheduleData) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          date: data.date,
          time: data.time,
          mode: data.mode,
          type: data.reason,
          status: "Rescheduled",
        })
        .eq("id", rescheduleData.appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment has been rescheduled.",
      });

      setShowRescheduleModal(false);
      setRescheduleData(null);
      onStatusChange?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reschedule appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on content
    if (e.target === e.currentTarget) {
      setExpandedId(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Appointment Requests
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No appointment requests
              </p>
            </div>
          ) : (
            requests.map((request) => {
              const age = calculateAge(request.clients?.date_of_birth || null);
              const initials =
                request.clients?.full_name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?";

              const isExpanded = expandedId === request.id;

              return (
                <div
                  key={request.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  {/* Request Header */}
                  <div className="flex items-center justify-between gap-4 p-4 bg-card hover:bg-muted/30 transition-colors">
                    {/* Client Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {request.clients?.full_name || "Unknown"}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.clients?.gender || "N/A"}
                          {age !== "Unknown" ? ` | ${age} years old` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(request.id, "Accepted")}
                        disabled={loading && processingId === request.id}
                        className="flex items-center gap-1 rounded-lg bg-success px-3 py-2 text-xs font-medium text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
                      >
                        <Check size={14} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRescheduleClick(request)}
                        disabled={loading && processingId === request.id}
                        className="flex items-center gap-1 rounded-lg border border-warning bg-warning/10 px-3 py-2 text-xs font-medium text-warning hover:bg-warning/20 disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleAction(request.id, "Declined")}
                        disabled={loading && processingId === request.id}
                        className="flex items-center gap-1 rounded-lg border border-muted bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={14} />
                        Decline
                      </button>
                    </div>
                  </div>
                  {/* Appointment Details Trigger */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : request.id)
                    }
                    className="w-full px-4 py-3 flex items-center justify-between border-t border-border bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
                  >
                    <span className="text-green-600">Appointment Details</span>
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {/* Appointment Details Content */}
                  {isExpanded && (
                    <div className="px-4 py-4 bg-background/50 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Type:
                        </span>
                        <span className="text-sm font-semibold text-success">
                          {request.type === "Virtual" ||
                          request.mode === "Virtual"
                            ? "Virtual"
                            : "Call"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date:
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(request.date).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Time:
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {request.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Reason:
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          General Consultation
                        </span>
                      </div>

                      {request.notes && (
                        <p className="text-sm text-foreground pt-2 border-t border-border break-words">
                          {request.notes}
                        </p>
                      )}
                    </div>
                  )}{" "}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reschedule Modal - Stacked on top */}
      {showRescheduleModal && rescheduleData && (
        <RescheduleAppointmentModal
          open={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          clientName={rescheduleData.clientName}
          clientGender={rescheduleData.clientGender}
          clientAge={rescheduleData.clientAge}
          onSubmit={handleRescheduleSubmit}
        />
      )}
    </div>
  );
};

interface RescheduleAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  clientGender: string | null;
  clientAge: number | string;
  onSubmit: (data: {
    date: string;
    time: string;
    mode: string;
    reason: string;
  }) => Promise<void>;
}

export const RescheduleAppointmentModal = ({
  open,
  onClose,
  clientName,
  clientGender,
  clientAge,
  onSubmit,
}: RescheduleAppointmentModalProps) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState("09:00");
  const [mode, setMode] = useState<"Virtual" | "Call">("Virtual");
  const [reason, setReason] = useState("General Consultation");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        date,
        time,
        mode,
        reason,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Reschedule Appointment
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Client Info Display */}
          <div className="mb-6 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Client
            </p>
            <p className="text-sm font-medium text-foreground">
              {clientName} | {clientGender || "N/A"}
              {clientAge !== "Unknown" ? ` | ${clientAge} years old` : ""}
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Appointment Type
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "Virtual" | "Call")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Virtual">Virtual</option>
              <option value="Call">Call</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="General Consultation">General Consultation</option>
              <option value="Follow-up Visit">Follow-up Visit</option>
              <option value="Health Check-up">Health Check-up</option>
              <option value="Test Review">Test Review</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Rescheduling..." : "Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentRequestsModal;
