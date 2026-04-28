import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  X as XIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface ScheduleAppointmentModalProps {
  open: boolean;
  clients: { id: string; full_name: string }[];
  onClose: () => void;
  onSubmit: (data: {
    clientId: string;
    clientName: string;
    appointmentType: "Virtual" | "Call";
    date: string;
    time: string;
    ampm: "AM" | "PM";
    reason: string;
    notes: string;
  }) => Promise<void>;
  loading?: boolean;
}

export const ScheduleAppointmentModal = ({
  open,
  clients,
  onClose,
  onSubmit,
  loading = false,
}: ScheduleAppointmentModalProps) => {
  const [clientName, setClientName] = useState("");
  const [appointmentType, setAppointmentType] = useState<"Virtual" | "Call">(
    "Virtual",
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("9:00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [reason, setReason] = useState("General Consultation");
  const [notes, setNotes] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const reasons = [
    "Follow-up Visit",
    "General Consultation",
    "Health Check-up",
    "Test Review",
    "Others",
  ];

  const timeOptions = useMemo(() => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = String(i % 12 || 12).padStart(2, "0");
        const minute = String(j).padStart(2, "0");
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => c.full_name === clientName);
    if (!selectedClient || !date || !time) return;

    try {
      await onSubmit({
        clientId: selectedClient.id,
        clientName,
        appointmentType,
        date: date.toISOString().split("T")[0],
        time,
        ampm,
        reason,
        notes,
      });
      // Reset form
      setClientName("");
      setAppointmentType("Virtual");
      setDate(new Date());
      setTime("9:00");
      setAmpm("AM");
      setReason("General Consultation");
      setNotes("");
    } catch (error) {
      console.error("Error scheduling appointment:", error);
    }
  };

  const goToPreviousMonth = () => {
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1),
    );
  };

  const monthYearString = calendarDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-300"></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        date &&
        date.getDate() === i &&
        date.getMonth() === calendarDate.getMonth() &&
        date.getFullYear() === calendarDate.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => {
            setDate(
              new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i),
            );
            setShowCalendar(false);
          }}
          className={`p-2 text-sm font-medium rounded ${
            isSelected
              ? "bg-primary text-white"
              : i === new Date().getDate() &&
                  calendarDate.getMonth() === new Date().getMonth() &&
                  calendarDate.getFullYear() === new Date().getFullYear()
                ? "bg-primary text-white font-bold"
                : "text-foreground hover:bg-muted"
          }`}
        >
          {i}
        </button>,
      );
    }

    return days;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-xl font-semibold text-foreground">
            Schedule New Appointment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-6"
        >
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client Name
            </label>
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:border-primary focus:outline-none"
              required
            >
              <option value="">Choose a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.full_name}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAppointmentType("Virtual")}
                className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${
                  appointmentType === "Virtual"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <Video
                  size={20}
                  className={
                    appointmentType === "Virtual"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    appointmentType === "Virtual"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Virtual
                </span>
                <span className="text-xs text-muted-foreground">
                  Video Consultation
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType("Call")}
                className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-2 ${
                  appointmentType === "Call"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <Phone
                  size={20}
                  className={
                    appointmentType === "Call"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    appointmentType === "Call"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Call
                </span>
                <span className="text-xs text-muted-foreground">
                  Call Consultation
                </span>
              </button>
            </div>
          </div>

          {/* Select Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Date
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-left focus:border-primary focus:outline-none"
              >
                {date
                  ? date.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Select a date"}
              </button>
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-4 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold text-foreground">
                      {monthYearString}
                    </span>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs font-medium text-muted-foreground text-center p-1"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Select Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:border-primary focus:outline-none"
                required
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={ampm}
                onChange={(e) => setAmpm(e.target.value as "AM" | "PM")}
                className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:border-primary focus:outline-none font-medium"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for Visit
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium text-left ${
                    reason === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input text-foreground hover:border-primary/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your symptoms or concerns"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              rows={4}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !clientName || !date || !time}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
