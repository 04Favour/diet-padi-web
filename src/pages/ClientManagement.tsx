import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  Utensils,
  CalendarDays,
  Check,
  X as XIcon,
  RotateCcw,
  Eye,
  Grid,
  List,
  Download,
  FileText,
  Activity,
  Heart,
  ChevronRight,
  ChevronDown,
  Pencil,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  Link,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreateDialog from "@/components/CreateDialog";
import AppointmentRequestsModal from "@/components/AppointmentRequestsModal";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// ─── Interfaces ───────────────────────────────────────────────
interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  occupation: string | null;
  marital_status: string | null;
  condition: string | null;
  status: string;
  height: string | null;
  weight: string | null;
  blood_type: string | null;
  bmi: number | null;
  avatar_url: string | null;
  provider_id: string;
  created_at: string;
  provider_name?: string;
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

interface Diagnosis {
  id: string;
  name: string;
  symptoms: string;
  details: string;
  dietary_consideration: string;
  dietitian_remark: string;
  recommendation: string;
  created_at: string;
  created_by?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by?: string;
}

type DetailTab = "general" | "medical";

// ─── Add Diagnosis Modal ──────────────────────────────────────
const AddDiagnosisModal = ({
  open,
  onClose,
  clientName,
  onSubmit,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  clientName: string;
  onSubmit: (
    data: Omit<Diagnosis, "id" | "created_at" | "created_by">,
  ) => Promise<void>;
  saving: boolean;
}) => {
  const [form, setForm] = useState({
    name: "",
    symptoms: "",
    details: "",
    dietary_consideration: "",
    dietitian_remark: "",
    recommendation: "",
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await onSubmit(form);
    setForm({
      name: "",
      symptoms: "",
      details: "",
      dietary_consideration: "",
      dietitian_remark: "",
      recommendation: "",
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden bg-card max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Diagnosis</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              For {clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {[
            {
              key: "name",
              label: "Diagnosis Name",
              placeholder: "Enter diagnosis name",
              type: "input",
            },
            {
              key: "symptoms",
              label: "Symptoms",
              placeholder: "Enter the symptoms you found",
              type: "input",
            },
            {
              key: "details",
              label: "Diagnosis Details",
              placeholder: "Add additional notes about the diagnosis",
              type: "textarea",
            },
            {
              key: "dietary_consideration",
              label: "Dietary consideration",
              placeholder: "Dietary consideration",
              type: "textarea",
            },
            {
              key: "dietitian_remark",
              label: "Dietition's Remark",
              placeholder: "Dietary remark",
              type: "textarea",
            },
            {
              key: "recommendation",
              label: "Recommendation",
              placeholder: "Write a recommendation",
              type: "textarea",
            },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-2">
                {field.label}
              </label>
              {field.type === "input" ? (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              ) : (
                <textarea
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Add Diagnosis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── View Diagnosis Modal ─────────────────────────────────────
const ViewDiagnosisModal = ({
  open,
  onClose,
  diagnosis,
}: {
  open: boolean;
  onClose: () => void;
  diagnosis: Diagnosis | null;
}) => {
  if (!open || !diagnosis) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden bg-card">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {diagnosis.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Diagnosed,{" "}
                {new Date(diagnosis.created_at).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {diagnosis.created_by && (
                <p className="text-sm text-muted-foreground">
                  By {diagnosis.created_by}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted">
                <Pencil size={14} />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-5">
            {diagnosis.symptoms && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Symptoms
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {diagnosis.symptoms}
                </p>
              </div>
            )}
            {diagnosis.details && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Diagnosis Details
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {diagnosis.details}
                </p>
              </div>
            )}
            {diagnosis.dietary_consideration && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">
                  Dietary Consideration
                </h4>
                <div className="space-y-1">
                  {diagnosis.dietary_consideration
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-foreground text-sm mt-0.5">
                          •
                        </span>
                        <p className="text-sm text-foreground">{line}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {diagnosis.dietitian_remark && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Dietitions Remark
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {diagnosis.dietitian_remark}
                </p>
              </div>
            )}
            {diagnosis.recommendation && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Recommendation
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {diagnosis.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add Note Modal ───────────────────────────────────────────
const AddNoteModal = ({
  open,
  onClose,
  providerName,
  onSubmit,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  providerName: string;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  saving: boolean;
}) => {
  const [title, setTitle] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById("note-editor");
    if (editor) {
      const text = editor.innerText || "";
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  };

  const handleInput = () => {
    const editor = document.getElementById("note-editor");
    if (editor) {
      const text = editor.innerText || "";
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  };

  const handleSave = async () => {
    const editorEl = document.getElementById("note-editor");
    const htmlContent = editorEl?.innerHTML || "";
    if (!title.trim()) return;
    await onSubmit({ title, content: htmlContent });
    setTitle("");
    setWordCount(0);
    if (editorEl) editorEl.innerHTML = "";
  };

  const readingTime = Math.ceil(wordCount / 200) || 1;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden bg-card">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
            <div className="flex-1 mr-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
              />
              <p className="text-sm text-muted-foreground mt-0.5">
                By {providerName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save & Close"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="m-6 rounded-xl border border-border overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2 bg-muted/20">
              <select
                onChange={(e) =>
                  document.execCommand("formatBlock", false, e.target.value)
                }
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground mr-1"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
              </select>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => execCommand("bold")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => execCommand("italic")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => execCommand("underline")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <UnderlineIcon size={13} />
              </button>
              <button
                onClick={() => execCommand("strikeThrough")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <Strikethrough size={13} />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => execCommand("justifyLeft")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => execCommand("justifyCenter")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <AlignCenter size={13} />
              </button>
              <button
                onClick={() => execCommand("justifyRight")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <AlignRight size={13} />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => execCommand("insertOrderedList")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <ListOrdered size={13} />
              </button>
              <button
                onClick={() => execCommand("insertUnorderedList")}
                className="p-1.5 rounded hover:bg-muted text-foreground"
              >
                <List size={13} />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button className="p-1.5 rounded hover:bg-muted text-foreground">
                <Link size={13} />
              </button>
              <button className="p-1.5 rounded hover:bg-muted text-foreground">
                <ImageIcon size={13} />
              </button>
            </div>

            {/* Editable area */}
            <div
              id="note-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="min-h-[280px] p-4 text-sm text-foreground focus:outline-none"
              style={{ lineHeight: "1.75" }}
            />

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-border px-4 py-2 bg-muted/10">
              <span className="text-xs text-muted-foreground">
                Word Count: {wordCount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Reading Time: ~{readingTime}min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── View Note Modal ──────────────────────────────────────────
const ViewNoteModal = ({
  open,
  onClose,
  note,
}: {
  open: boolean;
  onClose: () => void;
  note: Note | null;
}) => {
  if (!open || !note) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden bg-card">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {note.title}
              </h2>
              {note.created_by && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  By {note.created_by}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted">
                <Pencil size={14} />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
          <div
            className="px-6 pb-6 text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Client Progress Dropdown ─────────────────────────────────
const ClientProgressDropdown = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const parameters = [
    { label: "BMI", myValue: "20.2", nextGoal: "19.0" },
    { label: "Waist Circumference", myValue: "95cm", nextGoal: "72cm" },
    { label: "Waist to Hip Ratio", myValue: "95cm", nextGoal: "72cm" },
    {
      label: "Blood Pressure",
      myValue: "103/80 mm Hg",
      nextGoal: "95/80 mm Hg",
    },
    { label: "Lipid Profile", myValue: "143", nextGoal: "120" },
    { label: "Urine Acid", myValue: "2.8 mmol/L", nextGoal: "4.8 mmol/L" },
    { label: "Creatinine", myValue: "3.9 mmol/L", nextGoal: "4.7 mmol/L" },
    { label: "HBA 1C", myValue: "3.2%", nextGoal: "5.8%" },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Activity size={16} className="text-accent" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Client Progress
          </span>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-sm font-semibold text-foreground mb-4">
            Parameter
          </p>
          <div className="space-y-4">
            {parameters.map((param) => (
              <div key={param.label}>
                <p className="text-sm font-medium text-accent mb-2">
                  {param.label}
                </p>
                <div className="flex gap-12">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      My Value
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {param.myValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Next Goal
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {param.nextGoal}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const ClientManagement = () => {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = role === "super_admin" || role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [appointmentRequests, setAppointmentRequests] = useState<
    AppointmentRequest[]
  >([]);
  const [detailTab, setDetailTab] = useState<DetailTab>("general");
  const [clientDietPlans, setClientDietPlans] = useState<any[]>([]);
  const [clientPrescriptions, setClientPrescriptions] = useState<any[]>([]);
  const [allProviders, setAllProviders] = useState<
    { user_id: string; full_name: string }[]
  >([]);
  const [reassignProvider, setReassignProvider] = useState("");
  const [showReassign, setShowReassign] = useState(false);
  const [showAppointmentRequests, setShowAppointmentRequests] = useState(false);

  // New state
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showViewDiagnosis, setShowViewDiagnosis] = useState(false);
  const [showViewNote, setShowViewNote] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(
    null,
  );
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [clientDiagnoses, setClientDiagnoses] = useState<Diagnosis[]>([]);
  const [clientNotes, setClientNotes] = useState<Note[]>([]);
  const [progressExpanded, setProgressExpanded] = useState(false);
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const fetchClients = async () => {
    if (!user) return;
    const [clientRes, apptRes] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("*, clients(full_name, gender, date_of_birth)")
        .eq("status", "Upcoming")
        .order("date", { ascending: true }),
    ]);
    if (clientRes.data) {
      const providerIds = [
        ...new Set(clientRes.data.map((c) => c.provider_id)),
      ];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", providerIds);
      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.full_name]) || [],
      );
      setClients(
        clientRes.data.map((c) => ({
          ...c,
          provider_name: profileMap.get(c.provider_id) || "Unknown",
        })),
      );
    }
    if (apptRes.data) setAppointmentRequests(apptRes.data);
    const { data: provRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "provider");
    if (provRoles) {
      const { data: provProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in(
          "user_id",
          provRoles.map((r) => r.user_id),
        );
      if (provProfiles) setAllProviders(provProfiles);
    }
  };

  const fetchClientDetails = async (clientId: string) => {
    const [dietRes, rxRes] = await Promise.all([
      supabase
        .from("diet_plans")
        .select("*, clients(full_name)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*, clients(full_name)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]);
    if (dietRes.data) setClientDietPlans(dietRes.data);
    if (rxRes.data) setClientPrescriptions(rxRes.data);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);
  useEffect(() => {
    if (selectedClient) {
      fetchClientDetails(selectedClient.id);
      setClientDiagnoses([]);
      setClientNotes([]);
    }
  }, [selectedClient?.id]);

  const conditions = [
    "All",
    ...new Set(clients.map((c) => c.condition).filter(Boolean) as string[]),
  ];
  const statuses = ["All", "Active", "Pending", "Inactive"];

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCondition =
      conditionFilter === "All" || c.condition === conditionFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchCondition && matchStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "Active").length,
    inactive: clients.filter((c) => c.status === "Inactive").length,
    pending: clients.filter((c) => c.status === "Pending").length,
  };

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-success/10 text-success";
    if (status === "Pending") return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  const handleCreate = async (data: Record<string, string>) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("clients").insert({
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      address: data.address || null,
      occupation: data.occupation || null,
      marital_status: data.marital_status || null,
      condition: data.condition || null,
      height: data.height || null,
      weight: data.weight || null,
      blood_type: data.blood_type || null,
      provider_id: user.id,
    });
    setLoading(false);
    if (error) throw error;
    fetchClients();
  };

  const handleAcceptClient = async (clientId: string) => {
    const { error } = await supabase
      .from("clients")
      .update({ status: "Active" })
      .eq("id", clientId);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Client accepted!" });
      fetchClients();
    }
  };

  const handleDeclineClient = async (clientId: string) => {
    const { error } = await supabase
      .from("clients")
      .update({ status: "Inactive" })
      .eq("id", clientId);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Client declined" });
      fetchClients();
      setSelectedClient(null);
    }
  };

  const handleReassignClient = async (clientId: string) => {
    if (!reassignProvider) return;
    const { error } = await supabase
      .from("clients")
      .update({ provider_id: reassignProvider, status: "Pending" })
      .eq("id", clientId);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Client reassigned" });
      setShowReassign(false);
      setReassignProvider("");
      fetchClients();
      setSelectedClient(null);
    }
  };

  const downloadMedicalReport = (client: Client) => {
    const report = [
      `MEDICAL REPORT - ${client.full_name}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      ``,
      `=== GENERAL INFORMATION ===`,
      `Name: ${client.full_name}`,
      `Email: ${client.email || "N/A"}`,
      `Phone: ${client.phone || "N/A"}`,
      `Gender: ${client.gender || "N/A"}`,
      `Date of Birth: ${client.date_of_birth || "N/A"}`,
      `Address: ${client.address || "N/A"}`,
      `Occupation: ${client.occupation || "N/A"}`,
      `Marital Status: ${client.marital_status || "N/A"}`,
      ``,
      `=== MEDICAL INFORMATION ===`,
      `Condition: ${client.condition || "N/A"}`,
      `Height: ${client.height || "N/A"}`,
      `Weight: ${client.weight || "N/A"}`,
      `Blood Type: ${client.blood_type || "N/A"}`,
      `BMI: ${client.bmi || "N/A"}`,
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_report_${client.full_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Medical report downloaded" });
  };

  const handleAddDiagnosis = async (
    data: Omit<Diagnosis, "id" | "created_at" | "created_by">,
  ) => {
    setSavingDiagnosis(true);
    try {
      const newDiagnosis: Diagnosis = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        created_by: profile?.full_name || "Provider",
      };
      setClientDiagnoses((prev) => [newDiagnosis, ...prev]);
      setShowAddDiagnosis(false);
      toast({ title: "Diagnosis added successfully" });
    } finally {
      setSavingDiagnosis(false);
    }
  };

  const handleAddNote = async (data: { title: string; content: string }) => {
    setSavingNote(true);
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        created_by: profile?.full_name || "Provider",
      };
      setClientNotes((prev) => [newNote, ...prev]);
      setShowAddNote(false);
      toast({ title: "Note saved successfully" });
    } finally {
      setSavingNote(false);
    }
  };

  const createFields = [
    { name: "full_name", label: "Full Name", required: true },
    { name: "email", label: "Email", type: "email" as const },
    { name: "phone", label: "Phone" },
    { name: "date_of_birth", label: "Date of Birth", type: "date" as const },
    {
      name: "gender",
      label: "Gender",
      type: "select" as const,
      options: ["Male", "Female", "Other"],
    },
    { name: "condition", label: "Condition" },
    { name: "occupation", label: "Occupation" },
    {
      name: "marital_status",
      label: "Marital Status",
      type: "select" as const,
      options: ["Single", "Married", "Divorced", "Widowed"],
    },
    { name: "address", label: "Address", type: "textarea" as const },
    { name: "height", label: "Height" },
    { name: "weight", label: "Weight" },
    {
      name: "blood_type",
      label: "Blood Type",
      type: "select" as const,
      options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
  ];

  // ─── Client Detail Panel ────────────────────────────────────
  const renderClientDetail = (client: Client) => (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary shrink-0">
          {client.full_name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {client.full_name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {client.gender}
            {client.date_of_birth
              ? ` | ${new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()} years old`
              : ""}
          </p>
          {client.address && (
            <p className="text-xs text-success truncate">{client.address}</p>
          )}
        </div>
      </div>

      {/* Vitals */}
      <div className="mb-4 grid grid-cols-4 gap-2 border-y border-border py-4">
        {[
          { label: "Height", value: client.height || "—" },
          { label: "Weight", value: client.weight || "—" },
          { label: "Blood Type", value: client.blood_type || "—" },
          { label: "BMI", value: client.bmi?.toString() || "—" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-base sm:text-lg font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending actions */}
      {!isSuperAdmin && client.status === "Pending" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleAcceptClient(client.id)}
            className="flex items-center gap-1 rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-xs font-medium text-success hover:bg-success/20"
          >
            <Check size={14} /> Accept Client
          </button>
          <button
            onClick={() => handleDeclineClient(client.id)}
            className="flex items-center gap-1 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20"
          >
            <XIcon size={14} /> Decline
          </button>
          <button
            onClick={() => setShowReassign(true)}
            className="flex items-center gap-1 rounded-lg bg-accent/10 border border-accent/30 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20"
          >
            <RotateCcw size={14} /> Reassign
          </button>
        </div>
      )}

      {showReassign && (
        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            Reassign to Provider
          </p>
          <select
            value={reassignProvider}
            onChange={(e) => setReassignProvider(e.target.value)}
            className="mb-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select provider...</option>
            {allProviders
              .filter((p) => p.user_id !== user?.id)
              .map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.full_name}
                </option>
              ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReassign(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReassignClient(client.id)}
              disabled={!reassignProvider}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
            >
              Reassign
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex border-b border-border">
        {[
          { key: "general", label: "General Info" },
          { key: "medical", label: "Medical History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setDetailTab(t.key as DetailTab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${detailTab === t.key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── General Info ── */}
      {detailTab === "general" && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Personal Information
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: <Calendar size={16} className="text-accent" />,
                  label: "Date of Birth",
                  value: client.date_of_birth
                    ? new Date(client.date_of_birth).toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : "—",
                },
                {
                  icon: <FileText size={16} className="text-accent" />,
                  label: "Occupation",
                  value: client.occupation || "—",
                },
                {
                  icon: <Heart size={16} className="text-accent" />,
                  label: "Marital Status",
                  value: client.marital_status || "—",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Contact Information
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: <Mail size={16} className="text-accent" />,
                  label: "Email Address",
                  value: client.email || "—",
                },
                {
                  icon: <Phone size={16} className="text-accent" />,
                  label: "Phone Number",
                  value: client.phone || "—",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Activity size={16} className="text-accent" /> Diagnosis
              </h4>
              <button
                onClick={() => setShowAddDiagnosis(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {clientDiagnoses.length > 0 ? (
                clientDiagnoses.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDiagnosis(d);
                      setShowViewDiagnosis(true);
                    }}
                    className="w-full text-left text-sm text-foreground py-2 border-b border-border last:border-0 hover:text-primary transition-colors"
                  >
                    {d.name}
                  </button>
                ))
              ) : client.condition ? (
                client.condition.split(",").map((c, i) => (
                  <p
                    key={i}
                    className="text-sm text-foreground py-2 border-b border-border last:border-0"
                  >
                    {c.trim()}
                  </p>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No diagnoses recorded
                </p>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-accent">
                <ClipboardList size={16} className="text-accent" /> Note
              </h4>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {clientNotes.length > 0 ? (
                clientNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setShowViewNote(true);
                    }}
                    className="w-full flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/30 transition-colors rounded px-1"
                  >
                    <p className="text-sm text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(n.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <p className="text-sm text-foreground">
                      Review Meeting Brief
                    </p>
                    <span className="text-xs text-muted-foreground">
                      23 Sept. 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <p className="text-sm text-foreground">Meeting Brief</p>
                    <span className="text-xs text-muted-foreground">
                      05 Mar. 2024
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {clientPrescriptions.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Prescriptions
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {clientDietPlans.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Diet Plans</p>
            </div>
          </div>

          {/* Quick Actions */}
          {!isSuperAdmin && (
            <div className="space-y-2 pt-2">
              {[
                {
                  icon: <ClipboardList size={16} className="text-accent" />,
                  label: "Create a prescription",
                  path: "/prescriptions",
                },
                {
                  icon: <Utensils size={16} className="text-accent" />,
                  label: "Create a diet plan",
                  path: "/diet-plans",
                },
                {
                  icon: <CalendarDays size={16} className="text-accent" />,
                  label: "Schedule Appointment",
                  path: "/appointments",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Medical History ── */}
      {detailTab === "medical" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {[1, 2].map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Type 2 Diabetes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      RDN. Christian Blake
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      08 April, 2024
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-xs font-medium text-foreground">
                    Medical Report.pdf
                  </span>
                  <button onClick={() => downloadMedicalReport(client)}>
                    <Download
                      size={16}
                      className="text-muted-foreground hover:text-foreground"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <ClientProgressDropdown
            expanded={progressExpanded}
            onToggle={() => setProgressExpanded(!progressExpanded)}
          />

          {/* Diagnosis */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Activity size={16} className="text-accent" /> Diagnosis
              </h4>
              <button
                onClick={() => setShowAddDiagnosis(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {clientDiagnoses.length > 0 ? (
                clientDiagnoses.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDiagnosis(d);
                      setShowViewDiagnosis(true);
                    }}
                    className="w-full text-left text-sm text-foreground py-2 border-b border-border last:border-0 hover:text-primary transition-colors"
                  >
                    {d.name}
                  </button>
                ))
              ) : client.condition ? (
                client.condition.split(",").map((c, i) => (
                  <p
                    key={i}
                    className="text-sm text-foreground py-2 border-b border-border last:border-0"
                  >
                    {c.trim()}
                  </p>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No diagnoses recorded
                </p>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-accent">
                <ClipboardList size={16} className="text-accent" /> Note
              </h4>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {clientNotes.length > 0 ? (
                clientNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setShowViewNote(true);
                    }}
                    className="w-full flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/30 rounded px-1"
                  >
                    <p className="text-sm text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(n.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <p className="text-sm text-foreground">
                      Review Meeting Brief
                    </p>
                    <span className="text-xs text-muted-foreground">
                      23 Sept. 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <p className="text-sm text-foreground">Meeting Brief</p>
                    <span className="text-xs text-muted-foreground">
                      05 Mar. 2024
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {clientPrescriptions.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Prescriptions
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {clientDietPlans.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Diet Plans</p>
            </div>
          </div>

          {!isSuperAdmin && (
            <div className="space-y-2 pt-2">
              {[
                {
                  icon: <ClipboardList size={16} className="text-accent" />,
                  label: "Create a prescription",
                  path: "/prescriptions",
                },
                {
                  icon: <Utensils size={16} className="text-accent" />,
                  label: "Create a diet plan",
                  path: "/diet-plans",
                },
                {
                  icon: <CalendarDays size={16} className="text-accent" />,
                  label: "Schedule Appointment",
                  path: "/appointments",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Child Modals */}
      <AddDiagnosisModal
        open={showAddDiagnosis}
        onClose={() => setShowAddDiagnosis(false)}
        clientName={client.full_name}
        onSubmit={handleAddDiagnosis}
        saving={savingDiagnosis}
      />
      <ViewDiagnosisModal
        open={showViewDiagnosis}
        onClose={() => setShowViewDiagnosis(false)}
        diagnosis={selectedDiagnosis}
      />
      <AddNoteModal
        open={showAddNote}
        onClose={() => setShowAddNote(false)}
        providerName={profile?.full_name || "Provider"}
        onSubmit={handleAddNote}
        saving={savingNote}
      />
      <ViewNoteModal
        open={showViewNote}
        onClose={() => setShowViewNote(false)}
        note={selectedNote}
      />
    </div>
  );

  // ─── Super Admin view ───────────────────────────────────────
  if (isSuperAdmin) {
    return (
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">
              Client Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of all clients across the platform.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Total Clients",
              value: stats.total,
              color: "text-foreground",
            },
            { label: "Active", value: stats.active, color: "text-success" },
            {
              label: "Inactive",
              value: stats.inactive,
              color: "text-muted-foreground",
            },
            { label: "Pending", value: stats.pending, color: "text-warning" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Status" : s}
              </option>
            ))}
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Conditions" : c}
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
                  {[
                    "Client",
                    "Condition",
                    "Status",
                    "Provider",
                    "Last Visit",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground ${i === 1 ? "hidden sm:table-cell" : ""} ${i === 3 ? "hidden md:table-cell" : ""} ${i === 4 ? "hidden lg:table-cell" : ""} ${i === 5 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {client.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {client.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {client.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {client.condition || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(client.status)}`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {client.provider_name || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setDetailTab("general");
                          }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              filtered.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {client.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {client.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="text-foreground">
                        {client.condition || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(client.status)}`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="text-foreground">
                        {client.provider_name || "—"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setDetailTab("general");
                    }}
                    className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Super Admin Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
            <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4 z-10">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedClient.full_name}
                  </h3>
                  <button onClick={() => setSelectedClient(null)}>
                    <XIcon size={20} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="p-6">{renderClientDetail(selectedClient)}</div>
                <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Provider view ──────────────────────────────────────────
  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            Client Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your patients and their health conditions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus size={18} /> Add Client
          </button>
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <CalendarDays size={18} /> Manage Appointments
          </button>
        </div>
      </div>

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

      <AppointmentRequestsModal
        open={showAppointmentRequests}
        onClose={() => setShowAppointmentRequests(false)}
        requests={appointmentRequests}
        onStatusChange={() => {
          setShowAppointmentRequests(false);
          fetchClients();
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
        >
          {conditions.map((c) => (
            <option key={c}>{c === "All" ? "All Conditions" : c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
        >
          {statuses.map((s) => (
            <option key={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>
      </div>

      {/* Split Panel */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Client List */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">Clients</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              filtered.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setDetailTab("general");
                  }}
                  className={`flex cursor-pointer items-center justify-between border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 ${selectedClient?.id === client.id ? "bg-muted/50 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                      {client.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {client.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.condition || "No condition"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusColor(client.status)}`}
                  >
                    {client.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          {selectedClient ? (
            renderClientDetail(selectedClient)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <User size={48} className="mb-4 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">
                Select a Client
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a client from the list to view their profile
                <br />
                and manage their care.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add New Client"
        fields={createFields}
        onSubmit={handleCreate}
        loading={loading}
        successMessage="Client Added Successfully!"
      />
    </div>
  );
};

export default ClientManagement;
