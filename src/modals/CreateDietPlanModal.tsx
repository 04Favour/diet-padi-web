import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmLeaveDietPlanModal } from "./ConfirmLeaveDietPlanModal";
import { Plus, X } from "lucide-react";

interface ClientOption {
  id: string;
  full_name: string;
}

interface ProviderOption {
  user_id: string;
  full_name: string;
}

interface DayPlan {
  id: string;
  label: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface WeekPlan {
  title: string;
  days: DayPlan[];
}

interface CreateDietPlanModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Record<string, string>) => Promise<void>;
  loading?: boolean;
  clients: ClientOption[];
  providers: ProviderOption[];
  planTypes: string[];
}

const createDay = (index: number): DayPlan => ({
  id: `day-${Date.now()}-${index}`,
  label: `Day ${index}`,
  breakfast: "",
  lunch: "",
  dinner: "",
});

const defaultWeeks: WeekPlan[] = [
  {
    title: "Week 1",
    days: [createDay(1)],
  },
];

export const CreateDietPlanModal = ({
  open,
  onClose,
  onCreate,
  loading,
  clients,
  providers,
  planTypes,
}: CreateDietPlanModalProps) => {
  const [activeTab, setActiveTab] = useState<"basic" | "meal">("basic");
  const [activeWeek, setActiveWeek] = useState(0);
  const [weeks, setWeeks] = useState<WeekPlan[]>(defaultWeeks);
  const [form, setForm] = useState({
    client: "",
    provider: "",
    planType: "",
    planName: "",
    description: "",
    calories: "",
    goal: "",
    start_date: "",
    end_date: "",
  });
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveTab("basic");
      setActiveWeek(0);
      setWeeks(defaultWeeks);
      setForm({
        client: "",
        provider: "",
        planType: "",
        planName: "",
        description: "",
        calories: "",
        goal: "",
        start_date: "",
        end_date: "",
      });
      setDirty(false);
      setShowLeaveConfirm(false);
    }
  }, [open]);

  const weekButtons = useMemo(
    () =>
      weeks.map((week, index) => ({
        ...week,
        key: `week-${index}`,
        active: index === activeWeek,
      })),
    [weeks, activeWeek],
  );

  const activeWeekData = weeks[activeWeek] ?? weeks[0];

  const updateField = (name: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setDirty(true);
  };

  const handleDayChange = (
    dayId: string,
    field: keyof Omit<DayPlan, "id" | "label">,
    value: string,
  ) => {
    setWeeks((current) =>
      current.map((week, index) =>
        index !== activeWeek
          ? week
          : {
              ...week,
              days: week.days.map((day) =>
                day.id !== dayId ? day : { ...day, [field]: value },
              ),
            },
      ),
    );
    setDirty(true);
  };

  const handleAddDay = () => {
    setWeeks((current) =>
      current.map((week, index) =>
        index !== activeWeek
          ? week
          : {
              ...week,
              days: [...week.days, createDay(week.days.length + 1)],
            },
      ),
    );
    setDirty(true);
  };

  const handleRemoveDay = (dayId: string) => {
    setWeeks((current) =>
      current.map((week, index) =>
        index !== activeWeek
          ? week
          : {
              ...week,
              days: week.days.filter((day) => day.id !== dayId),
            },
      ),
    );
    setDirty(true);
  };

  const handleAddWeek = () => {
    setWeeks((current) => [
      ...current,
      {
        title: `Week ${current.length + 1}`,
        days: [createDay(1)],
      },
    ]);
    setActiveWeek(weeks.length);
    setDirty(true);
  };

  const handleCloseRequest = () => {
    if (dirty) {
      setShowLeaveConfirm(true);
      return;
    }

    onClose();
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    setDirty(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreate({
      client: form.client,
      provider: form.provider,
      plan_name: form.planName,
      planType: form.planType,
      notes: form.description,
      start_date: form.start_date,
      end_date: form.end_date,
      calories: form.calories,
      goal: form.goal,
      weeks: JSON.stringify(weeks),
    });
    setDirty(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => !openState && handleCloseRequest()}
    >
      <DialogContent className="w-full max-w-4xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Create New Diet Plan
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseRequest}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 border-b border-border px-6 py-5 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "basic"
                    ? "border border-success bg-success/10 text-success"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("meal")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "meal"
                    ? "border border-success bg-success/10 text-success"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Weekly Meal Planning
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {activeTab === "basic" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Client{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </label>
                  <select
                    value={form.client}
                    onChange={(e) => updateField("client", e.target.value)}
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                  >
                    <option value="">Choose a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.full_name}>
                        {client.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Plan Type
                  </label>
                  <select
                    value={form.planType}
                    onChange={(e) => updateField("planType", e.target.value)}
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                  >
                    <option value="">Select type</option>
                    {planTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={form.planName}
                    onChange={(e) => updateField("planName", e.target.value)}
                    placeholder="Enter the plan name"
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Plan Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Describe the diet plan"
                    rows={4}
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    0/200 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-3 pb-5">
                  {weekButtons.map((week, index) => (
                    <button
                      key={week.key}
                      type="button"
                      onClick={() => setActiveWeek(index)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        week.active
                          ? "border-success bg-success/10 text-success"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {week.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddWeek}
                    className="inline-flex items-center rounded-2xl border border-success px-4 py-2 text-sm font-medium text-success transition hover:bg-success/10"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="rounded-3xl border border-success/30 bg-success/5 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activeWeekData.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="rounded-2xl bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
                    >
                      Add Day
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeWeekData.days.map((day) => (
                      <div
                        key={day.id}
                        className="rounded-3xl border border-border bg-background p-4"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {day.label}
                            </p>
                          </div>
                          {activeWeekData.days.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDay(day.id)}
                              className="rounded-full p-2 text-destructive transition hover:bg-destructive/10"
                              aria-label="Remove day"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            { label: "Breakfast", field: "breakfast" as const },
                            { label: "Lunch", field: "lunch" as const },
                            { label: "Dinner", field: "dinner" as const },
                          ].map((item) => (
                            <div key={item.label} className="space-y-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {item.label}
                              </label>
                              <div className="relative rounded-2xl border border-success/30 bg-transparent">
                                <input
                                  type="text"
                                  value={day[item.field]}
                                  onChange={(e) =>
                                    handleDayChange(
                                      day.id,
                                      item.field,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Food item"
                                  className="w-full rounded-2xl border-none bg-transparent px-4 py-3 text-sm text-foreground outline-none"
                                />
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground hover:bg-success/90"
                                >
                                  Recipe
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCloseRequest}
              className="rounded-2xl border border-success px-5 py-3 text-sm font-medium text-success hover:bg-success/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.planName.trim() || loading}
              className="rounded-2xl bg-success px-5 py-3 text-sm font-medium text-success-foreground transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Diet Plan"}
            </button>
          </div>
        </form>
      </DialogContent>

      <ConfirmLeaveDietPlanModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleConfirmLeave}
      />
    </Dialog>
  );
};
