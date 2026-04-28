import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface Prescription {
  id: string;
  medication: string;
  dosage: string | null;
  instructions: string | null;
  status: string;
  date: string;
  client_id: string | null;
  provider_id: string;
  clients?: { full_name: string } | null;
  provider_profile?: { full_name: string } | null;
}

interface EditPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  onSave?: (data: Record<string, string>) => Promise<void>;
  loading?: boolean;
  clients: Array<{ id: string; full_name: string }>;
  medications: Array<{ id: string; name: string }>;
}

export const EditPrescriptionModal = ({
  open,
  onClose,
  prescription,
  onSave,
  loading,
  clients = [],
  medications = [],
}: EditPrescriptionModalProps) => {
  const [form, setForm] = useState({
    client: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: "",
    instructions: "",
  });

  useEffect(() => {
    if (prescription && open) {
      setForm({
        client: prescription.client_id || "",
        medication: prescription.medication || "",
        dosage: prescription.dosage || "",
        frequency: "",
        duration: "",
        startDate: prescription.date || "",
        instructions: prescription.instructions || "",
      });
    }
  }, [prescription, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave && prescription) {
      await onSave({ ...form, id: prescription.id });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Edit Prescription
        </h2>

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Instructions (Optional)
            </label>
            <textarea
              value={form.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              placeholder="Add any additional instructions..."
              className="w-full rounded-2xl border border-success/30 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-success resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
  );
};
