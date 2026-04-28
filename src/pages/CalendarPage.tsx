import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Event {
  id: string;
  client_name: string;
  time: string;
  mode: string;
}

const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, Event[]>>({});
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const fetchAppointments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("appointments")
      .select("*, clients(full_name)")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return;
    }

    const eventsByDate: Record<string, Event[]> = {};
    data?.forEach((apt: any) => {
      const dateKey = apt.date;
      if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
      eventsByDate[dateKey].push({
        id: apt.id,
        client_name: apt.clients?.full_name || "Unknown",
        time: apt.time || "",
        mode: apt.mode === "Virtual" ? "virtual" : "in-person",
      });
    });
    setEvents(eventsByDate);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const navigate = (dir: number) =>
    setCurrentDate(new Date(year, month + dir, 1));

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-primary">
        Calendar
      </h1>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
          <button
            onClick={() => navigate(1)}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const dateKey = day
              ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              : "";
            const dayEvents = dateKey ? events[dateKey] : undefined;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={i}
                className={`min-h-[60px] rounded-lg p-1 text-sm ${day ? "hover:bg-muted cursor-pointer" : ""} ${isToday ? "bg-primary/10" : ""}`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-block rounded-full px-1.5 py-0.5 text-xs ${isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"}`}
                    >
                      {day}
                    </span>
                    {dayEvents?.map((e, j) => (
                      <div
                        key={j}
                        className={`mt-1 truncate rounded px-1 py-0.5 text-[10px] font-medium ${e.mode === "virtual" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}
                      >
                        {e.client_name}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
