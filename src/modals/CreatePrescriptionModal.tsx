import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface CreatePrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: Record<string, string>) => Promise<void>;
  loading?: boolean;
  clients: Array<{ id: string; full_name: string }>;
  medications: Array<{ id: string; name: string }>;
}

export const CreatePrescriptionModal = ({
  open,
  onClose,
  onCreate,
  loading,
  clients = [],
  medications = [],
}: CreatePrescriptionModalProps) => {
  const [form, setForm] = useState({
    client: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreate) {
      await onCreate(form);
      setForm({
        client: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        startDate: "",
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="w-full max-w-md p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Create New Prescription
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Select Client
            </label>
            <select
              value={form.client}
              onChange={(e) => handleChange("client", e.target.value)}
              className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
              required
            >
              <option value="">Choose a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Medication
              </label>
              <select
                value={form.medication}
                onChange={(e) => handleChange("medication", e.target.value)}
                className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                required
              >
                <option value="">Name of the medication</option>
                {medications.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Dosage
              </label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
                placeholder="E.g 500mg"
                className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) => handleChange("frequency", e.target.value)}
                className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                required
              >
                <option value="">Set frequency</option>
                <option value="once">Once daily</option>
                <option value="twice">Twice daily</option>
                <option value="thrice">Thrice daily</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Duration
              </label>
              <select
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
                required
              >
                <option value="">Set duration</option>
                <option value="3days">3 Days</option>
                <option value="7days">7 Days</option>
                <option value="14days">14 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-success px-4 py-2.5 text-sm font-medium text-success hover:bg-success/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-success px-4 py-2.5 text-sm font-medium text-success-foreground transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
