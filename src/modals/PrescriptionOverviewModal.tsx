import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, AlertCircle } from "lucide-react";

interface PrescriptionOverviewModalProps {
  open: boolean;
  onClose: () => void;
  onMarkCompleted: () => void;
  onDiscontinue: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const PrescriptionOverviewModal = ({
  open,
  onClose,
  onMarkCompleted,
  onDiscontinue,
  expanded = false,
  onToggleExpand,
}: PrescriptionOverviewModalProps) => (
  <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
    <DialogContent className="w-full max-w-md p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            Prescription Overview
          </h2>
          <div className="mt-2 inline-flex items-center rounded-full bg-success/10 px-3 py-1">
            <span className="text-xs font-medium text-success">Active</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {!expanded ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <div className="mt-1 rounded-lg bg-orange-50 p-2">
              <AlertCircle size={20} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Medication 1</p>
              <p className="text-xs text-muted-foreground">24 Sept. 2024</p>
            </div>
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">Medication 1</p>
                <p className="text-xs text-muted-foreground">24 Sept. 2024</p>
              </div>
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="text-lg">‹</span>
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={onDiscontinue}
                className="flex-1 rounded-lg border border-destructive px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Discontinue
              </button>
              <button
                type="button"
                onClick={onMarkCompleted}
                className="flex-1 rounded-lg bg-success px-3 py-2.5 text-sm font-medium text-success-foreground hover:bg-success/90"
              >
                Mark Completed
              </button>
            </div>

            <div className="mb-4 flex gap-1">
              {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((day, idx) => (
                <div
                  key={day}
                  className={`h-2 flex-1 rounded-full ${
                    idx < 2 ? "bg-success" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Lisinopril</p>
                <p className="text-sm text-muted-foreground">10mg</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="text-sm font-medium text-success">
                    Twice daily
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">3 Days</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prescription ID</p>
                <p className="text-sm font-medium text-foreground">RX001</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
      >
        Close
      </button>
    </DialogContent>
  </Dialog>
);
