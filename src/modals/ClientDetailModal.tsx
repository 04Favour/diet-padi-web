import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  Download,
  MessageSquare,
  ClipboardList,
  Utensils,
  CalendarDays,
  Heart,
  Activity,
  X as XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ClientDetailModalProps {
  open: boolean;
  client: any;
  isSuperAdmin: boolean;
  onClose: () => void;
}

export const ClientDetailModal = ({
  open,
  client,
  isSuperAdmin,
  onClose,
}: ClientDetailModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detailTab, setDetailTab] = useState<
    "general" | "medical" | "progress"
  >("general");

  if (!open || !client) return null;

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-success/10 text-success";
    if (status === "Pending") return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {client.full_name}
          </h3>
          <button onClick={onClose}>
            <XIcon size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 text-lg sm:text-xl font-bold text-primary shrink-0">
            {client.full_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {client.full_name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {client.gender}
              {client.date_of_birth
                ? ` | ${new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()} years old`
                : ""}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(client.status)}`}
            >
              {client.status}
            </span>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="mb-4 flex border-b border-border overflow-x-auto">
          {[
            {
              key: "general" as const,
              label: "General Info",
              icon: <User size={14} />,
            },
            {
              key: "medical" as const,
              label: "Medical Info",
              icon: <Heart size={14} />,
            },
            {
              key: "progress" as const,
              label: "Progress",
              icon: <Activity size={14} />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setDetailTab(t.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                detailTab === t.key
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {detailTab === "general" && (
          <div className="space-y-3">
            {[
              {
                label: "Email",
                value: client.email,
                icon: <Mail size={14} />,
              },
              {
                label: "Phone",
                value: client.phone,
                icon: <Phone size={14} />,
              },
              {
                label: "Date of Birth",
                value: client.date_of_birth,
              },
              {
                label: "Occupation",
                value: client.occupation,
              },
              {
                label: "Marital Status",
                value: client.marital_status,
              },
              {
                label: "Address",
                value: client.address,
              },
              ...(isSuperAdmin
                ? [{ label: "Provider", value: client.provider_name }]
                : []),
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  {"icon" in item && item.icon}
                  {item.label}
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground text-right">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        )}

        {detailTab === "medical" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Height", value: client.height || "—" },
                { label: "Weight", value: client.weight || "—" },
                { label: "Blood Type", value: client.blood_type || "—" },
                { label: "BMI", value: client.bmi?.toString() || "—" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border p-3 text-center"
                >
                  <p className="text-base sm:text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <p className="text-sm text-muted-foreground">Condition</p>
              <p className="text-sm font-medium text-foreground">
                {client.condition || "—"}
              </p>
            </div>
          </div>
        )}

        {detailTab === "progress" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Treatment Summary
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Diet Plans</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
};
