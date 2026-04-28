import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface PrescriptionHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

type HistoryTab = "All" | "Active" | "Discontinued" | "Completed";

export const PrescriptionHistoryModal = ({
  open,
  onClose,
}: PrescriptionHistoryModalProps) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>("All");

  const medications = [
    {
      name: "Lisinopril",
      prescriber: "RD Lizzy Adeyunju",
      duration: "5 days",
      status: "Active",
    },
    {
      name: "Lisinopril",
      prescriber: "RD Lizzy Adeyunju",
      duration: "5 days",
      status: "Active",
    },
    {
      name: "Amogzil",
      prescriber: "RN Patrick Omole",
      duration: "3 days",
      status: "Discontinued",
    },
  ];

  const filteredMeds = medications.filter((med) => {
    if (activeTab === "All") return true;
    return med.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="w-full max-w-md p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Prescription History
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex gap-2 border-b border-border">
          {(["All", "Active", "Discontinued", "Completed"] as HistoryTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? "border-success text-success"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground">
            <div>Medication Name</div>
            <div>Prescribed By</div>
            <div>Duration</div>
          </div>

          {filteredMeds.map((med, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4 text-sm last:border-0"
            >
              <div className="text-foreground font-medium">{med.name}</div>
              <div className="text-muted-foreground">{med.prescriber}</div>
              <div className="text-foreground">{med.duration}</div>
            </div>
          ))}

          {filteredMeds.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No {activeTab.toLowerCase()} prescriptions
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
