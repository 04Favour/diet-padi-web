import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmLeaveDietPlanModal } from "./ConfirmLeaveDietPlanModal";
import { Plus } from "lucide-react";

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
  meals?: unknown;
}

interface EditDietPlanModalProps {
  open: boolean;
  onClose: () => void;
  plan: DietPlan | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
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

export const EditDietPlanModal = ({
  open,
  onClose,
  plan,
  onSave,
  loading,
  clients,
  providers,
  planTypes,
}: EditDietPlanModalProps) => {
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
    if (open && plan) {
      setForm({
        client: plan.client_id || "",
        provider: plan.provider_id || "",
        planType: "",
        planName: plan.plan_name || "",
        description: plan.description || "",
        calories: "",
        goal: "",
        start_date: plan.start_date || "",
        end_date: plan.end_date || "",
      });
      setActiveTab("basic");
      setActiveWeek(0);
      setWeeks(defaultWeeks);
      setDirty(false);
    }
  }, [open, plan]);

  const totalDays = useMemo(() => {
    return weeks.reduce((sum, week) => sum + week.days.length, 0);
  }, [weeks]);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleDayChange = (
    weekIndex: number,
    dayIndex: number,
    meal: "breakfast" | "lunch" | "dinner",
    value: string,
  ) => {
    setWeeks((prevWeeks) => {
      const updated = [...prevWeeks];
      updated[weekIndex].days[dayIndex][meal] = value;
      return updated;
    });
    setDirty(true);
  };

  const handleAddDay = () => {
    setWeeks((prevWeeks) => {
      const updated = [...prevWeeks];
      const lastDay =
        updated[activeWeek].days[updated[activeWeek].days.length - 1];
      const dayNum = parseInt(lastDay.label.replace("Day ", "")) + 1;
      updated[activeWeek].days.push(createDay(dayNum));
      return updated;
    });
    setDirty(true);
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (weeks[activeWeek].days.length <= 1) return;
    setWeeks((prevWeeks) => {
      const updated = [...prevWeeks];
      updated[activeWeek].days.splice(dayIndex, 1);
      return updated;
    });
    setDirty(true);
  };

  const handleAddWeek = () => {
    setWeeks((prevWeeks) => [
      ...prevWeeks,
      {
        title: `Week ${prevWeeks.length + 1}`,
        days: [createDay(1)],
      },
    ]);
    setDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (plan && onSave) {
      const mealsData = {
        weeks,
        totalDays,
        calories: form.calories,
      };
      await onSave({
        ...form,
        id: plan.id,
        meals: mealsData,
      });
      onClose();
    }
  };

  const handleClose = () => {
    if (dirty) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(openState) => !openState && handleClose()}
      >
        <DialogContent className="w-full max-w-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Edit Diet Plan
          </h2>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-border">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "basic" ? "border-b-2 border-success text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab("meal")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "meal" ? "border-b-2 border-success text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Weekly Meal Planning ({totalDays} Days)
            </button>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {activeTab === "basic" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Client
                    </label>
                    <select
                      value={form.client}
                      onChange={(e) =>
                        handleFormChange("client", e.target.value)
                      }
                      className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                      required
                    >
                      <option value="">Select client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Provider
                    </label>
                    <select
                      value={form.provider}
                      onChange={(e) =>
                        handleFormChange("provider", e.target.value)
                      }
                      className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                      required
                    >
                      <option value="">Select provider</option>
                      {providers.map((p) => (
                        <option key={p.user_id} value={p.user_id}>
                          {p.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={form.planName}
                    onChange={(e) =>
                      handleFormChange("planName", e.target.value)
                    }
                    placeholder="E.g. High Protein Plan"
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Describe the plan..."
                    className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Calories (Daily)
                    </label>
                    <input
                      type="number"
                      value={form.calories}
                      onChange={(e) =>
                        handleFormChange("calories", e.target.value)
                      }
                      placeholder="E.g. 2000"
                      className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        handleFormChange("start_date", e.target.value)
                      }
                      className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        handleFormChange("end_date", e.target.value)
                      }
                      className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Week Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {weeks.map((week, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveWeek(idx)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeWeek === idx ? "bg-success text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
                    >
                      {week.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddWeek}
                    className="px-4 py-2 text-sm font-medium rounded-full border border-success text-success hover:bg-success/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Week
                  </button>
                </div>

                {/* Current Week Days */}
                <div className="space-y-3">
                  {weeks[activeWeek].days.map((day, dayIdx) => (
                    <div
                      key={day.id}
                      className="border border-border rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">
                          {day.label}
                        </h4>
                        {weeks[activeWeek].days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(dayIdx)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Breakfast
                          </label>
                          <input
                            type="text"
                            value={day.breakfast}
                            onChange={(e) =>
                              handleDayChange(
                                activeWeek,
                                dayIdx,
                                "breakfast",
                                e.target.value,
                              )
                            }
                            placeholder="E.g. Oats with berries"
                            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-success"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Lunch
                          </label>
                          <input
                            type="text"
                            value={day.lunch}
                            onChange={(e) =>
                              handleDayChange(
                                activeWeek,
                                dayIdx,
                                "lunch",
                                e.target.value,
                              )
                            }
                            placeholder="E.g. Grilled chicken salad"
                            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-success"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Dinner
                          </label>
                          <input
                            type="text"
                            value={day.dinner}
                            onChange={(e) =>
                              handleDayChange(
                                activeWeek,
                                dayIdx,
                                "dinner",
                                e.target.value,
                              )
                            }
                            placeholder="E.g. Fish and vegetables"
                            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-success"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="w-full py-2 text-sm font-medium text-success border border-success rounded-2xl hover:bg-success/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 rounded-2xl border border-success px-4 py-2.5 text-sm font-medium text-success hover:bg-success/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-success px-4 py-2.5 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showLeaveConfirm && (
        <ConfirmLeaveDietPlanModal
          open={showLeaveConfirm}
          onStay={() => setShowLeaveConfirm(false)}
          onLeave={() => {
            setShowLeaveConfirm(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
