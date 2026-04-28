// ============================================================
// ADD THESE IMPORTS (add to existing imports in ClientManagement.tsx)
// ============================================================
// import { Pencil, ChevronDown, ChevronUp, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image } from "lucide-react";

// ============================================================
// ADD THESE INTERFACES (after existing interfaces)
// ============================================================
/*
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
*/

// ============================================================
// ADD THESE STATE VARIABLES inside ClientManagement component
// ============================================================
/*
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showViewDiagnosis, setShowViewDiagnosis] = useState(false);
  const [showViewNote, setShowViewNote] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [clientDiagnoses, setClientDiagnoses] = useState<Diagnosis[]>([]);
  const [clientNotes, setClientNotes] = useState<Note[]>([]);
  const [progressExpanded, setProgressExpanded] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    name: "", symptoms: "", details: "", dietary_consideration: "", dietitian_remark: "", recommendation: ""
  });
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
*/

// ============================================================
// REPLACE renderClientDetail with this full implementation
// ============================================================

import { useState } from "react";
import {
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Activity,
  ClipboardList,
  Utensils,
  CalendarDays,
  Mail,
  Phone,
  Calendar,
  FileText,
  Heart,
  Check,
  RotateCcw,
  Pencil,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
} from "lucide-react";

// ── ADD DIAGNOSIS MODAL ──────────────────────────────────────
export const AddDiagnosisModal = ({
  open,
  onClose,
  clientName,
  onSubmit,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  clientName: string;
  onSubmit: (data: {
    name: string;
    symptoms: string;
    details: string;
    dietary_consideration: string;
    dietitian_remark: string;
    recommendation: string;
  }) => Promise<void>;
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
      <div className="w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden bg-card">
        {/* Scroll container */}
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Add Diagnosis
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                For {clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Diagnosis Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diagnosis Name
              </label>
              <input
                type="text"
                placeholder="Enter diagnosis name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Symptoms
              </label>
              <input
                type="text"
                placeholder="Enter the symptoms you found"
                value={form.symptoms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, symptoms: e.target.value }))
                }
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Diagnosis Details */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diagnosis Details
              </label>
              <textarea
                placeholder="Add additional notes about the diagnosis"
                value={form.details}
                onChange={(e) =>
                  setForm((f) => ({ ...f, details: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Dietary Consideration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dietary consideration
              </label>
              <textarea
                placeholder="Dietary consideration"
                value={form.dietary_consideration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dietary_consideration: e.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Dietitian's Remark */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dietition's Remark
              </label>
              <textarea
                placeholder="Dietary remark"
                value={form.dietitian_remark}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dietitian_remark: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recommendation
              </label>
              <textarea
                placeholder="Write a recommendation"
                value={form.recommendation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recommendation: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-primary/40 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Actions */}
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
    </div>
  );
};

// ── VIEW DIAGNOSIS MODAL ─────────────────────────────────────
export const ViewDiagnosisModal = ({
  open,
  onClose,
  diagnosis,
}: {
  open: boolean;
  onClose: () => void;
  diagnosis: {
    name: string;
    created_at: string;
    created_by?: string;
    symptoms: string;
    details: string;
    dietary_consideration: string;
    dietitian_remark: string;
    recommendation: string;
  } | null;
}) => {
  if (!open || !diagnosis) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
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
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted">
              <Pencil size={14} />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X size={16} />
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
                {diagnosis.dietary_consideration.split("\n").map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-foreground text-sm mt-0.5">•</span>
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
  );
};

// ── ADD NOTE MODAL ───────────────────────────────────────────
export const AddNoteModal = ({
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
  const [content, setContent] = useState("");
  const editorRef = useState<HTMLDivElement | null>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleSave = async () => {
    const editorEl = document.getElementById("note-editor");
    const htmlContent = editorEl?.innerHTML || content;
    await onSubmit({ title, content: htmlContent });
    setTitle("");
    setContent("");
  };

  const wordCount = content
    .replace(/<[^>]*>/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
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
        <div className="mx-6 mb-4 rounded-xl border border-border overflow-hidden">
          {/* Title area in editor */}
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Note content area</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2 bg-muted/30">
            <select className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground mr-1">
              <option>Paragraph</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
            </select>
            <button
              onClick={() => execCommand("foreColor", "#000")}
              className="p-1.5 rounded hover:bg-muted text-foreground font-bold text-sm"
            >
              A
            </button>
            <button
              onClick={() => execCommand("hiliteColor", "#ffff00")}
              className="p-1.5 rounded hover:bg-muted text-foreground text-sm"
            >
              <span className="relative">
                <span className="opacity-60">A</span>
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"></span>
              </span>
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => execCommand("bold")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => execCommand("italic")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => execCommand("underline")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <UnderlineIcon size={14} />
            </button>
            <button
              onClick={() => execCommand("strikeThrough")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <Strikethrough size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => execCommand("justifyLeft")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => execCommand("justifyCenter")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <AlignCenter size={14} />
            </button>
            <button
              onClick={() => execCommand("justifyRight")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <AlignRight size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => execCommand("insertOrderedList")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <ListOrdered size={14} />
            </button>
            <button
              onClick={() => execCommand("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-muted"
            >
              <List size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button className="p-1.5 rounded hover:bg-muted">
              <Link size={14} />
            </button>
            <button className="p-1.5 rounded hover:bg-muted">
              <ImageIcon size={14} />
            </button>
          </div>

          {/* Content editable area */}
          <div
            id="note-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="min-h-[300px] p-4 text-sm text-foreground focus:outline-none"
            style={{ lineHeight: "1.7" }}
          />

          {/* Word count footer */}
          <div className="flex items-center gap-2 border-t border-border px-4 py-2 bg-muted/20">
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
  );
};

// ── VIEW NOTE MODAL ──────────────────────────────────────────
export const ViewNoteModal = ({
  open,
  onClose,
  note,
}: {
  open: boolean;
  onClose: () => void;
  note: {
    title: string;
    content: string;
    created_at: string;
    created_by?: string;
  } | null;
}) => {
  if (!open || !note) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{note.title}</h2>
            {note.created_by && (
              <p className="text-sm text-muted-foreground mt-0.5">
                By {note.created_by}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted">
              <Pencil size={14} />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div
          className="px-6 pb-6 text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </div>
    </div>
  );
};

// ── CLIENT PROGRESS DROPDOWN ─────────────────────────────────
export const ClientProgressDropdown = ({
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

// ============================================================
// UPDATED renderClientDetail - replace the full function
// ============================================================
// PASTE THIS INSIDE YOUR ClientManagement component,
// replacing the existing renderClientDetail function:
//
// const renderClientDetail = (client: Client, isModal: boolean = false) => (
//   ... see below ...
// )

export const RenderClientDetailBody = ({
  client,
  isSuperAdmin,
  detailTab,
  setDetailTab,
  clientPrescriptions,
  clientDietPlans,
  allProviders,
  user,
  showReassign,
  setShowReassign,
  reassignProvider,
  setReassignProvider,
  handleAcceptClient,
  handleDeclineClient,
  handleReassignClient,
  navigate,
  // new props
  showAddDiagnosis,
  setShowAddDiagnosis,
  showAddNote,
  setShowAddNote,
  showViewDiagnosis,
  setShowViewDiagnosis,
  showViewNote,
  setShowViewNote,
  selectedDiagnosis,
  setSelectedDiagnosis,
  selectedNote,
  setSelectedNote,
  clientDiagnoses,
  clientNotes,
  progressExpanded,
  setProgressExpanded,
  savingDiagnosis,
  savingNote,
  handleAddDiagnosis,
  handleAddNote,
  downloadMedicalReport,
}: any) => {
  return (
    <div>
      {/* Client Header */}
      <div className="mb-4 flex items-center gap-3 sm:gap-4">
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

      {/* Vitals Row */}
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
            <X size={14} /> Decline
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
              .filter((p: any) => p.user_id !== user?.id)
              .map((p: any) => (
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
            onClick={() => setDetailTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              detailTab === t.key
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL INFO ── */}
      {detailTab === "general" && (
        <div className="space-y-6">
          {/* Personal Information */}
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

          {/* Contact Information */}
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
                clientDiagnoses.map((d: any) => (
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
                client.condition.split(",").map((c: string, i: number) => (
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
                clientNotes.map((n: any) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setShowViewNote(true);
                    }}
                    className="w-full flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/30 transition-colors rounded px-1"
                  >
                    <p className="text-sm text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, " ")}
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

          {/* Prescriptions + Diet Plans */}
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

      {/* ── MEDICAL HISTORY ── */}
      {detailTab === "medical" && (
        <div className="space-y-4">
          {/* Records */}
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

          {/* Client Progress Dropdown */}
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
                clientDiagnoses.map((d: any) => (
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
                client.condition.split(",").map((c: string, i: number) => (
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
                clientNotes.map((n: any) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setShowViewNote(true);
                    }}
                    className="w-full flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/30 rounded px-1"
                  >
                    <p className="text-sm text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
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

          {/* Prescriptions + Diet Plans */}
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
    </div>
  );
};
