import { X, CheckCircle, Clock, XCircle } from "lucide-react";

interface DietPlan {
  id: string;
  plan_name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  provider_profile?: { full_name: string } | null;
  clients?: { full_name: string } | null;
  meals: any;
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

export const DietPlanDetailsModal = ({
  plan,
  onClose,
  onApprove,
  onReject,
}: {
  plan: DietPlan;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const config = statusConfig[plan.status] || statusConfig["Pending"];
  const calories =
    plan.meals && typeof plan.meals === "object" && !Array.isArray(plan.meals)
      ? plan.meals.calories || "—"
      : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Diet Plan Details
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
          {config.icon} {plan.status}
        </span>
        <h2 className="mt-3 text-xl font-bold text-foreground">
          {plan.plan_name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.description || "No description"}
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Provider</p>
            <p className="text-sm font-medium text-foreground">
              {plan.provider_profile?.full_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="text-sm font-medium text-foreground">
              {plan.clients?.full_name || "—"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium text-foreground">
                {plan.start_date || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Date</p>
              <p className="text-sm font-medium text-foreground">
                {plan.end_date || "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="text-sm font-medium text-foreground">{calories}</p>
          </div>
        </div>

        {plan.status === "Pending" && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 rounded-lg bg-success py-2.5 text-sm font-medium text-success-foreground hover:bg-success/90"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
};
