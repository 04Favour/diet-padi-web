import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ConfirmLeaveDietPlanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmLeaveDietPlanModal = ({
  open,
  onClose,
  onConfirm,
}: ConfirmLeaveDietPlanModalProps) => (
  <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
    <DialogContent className="w-full max-w-md p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            You’re about to leave this meal plan.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Unsaved data may be lost. Do you still want to exit?
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-success px-4 py-2.5 text-sm font-medium text-success hover:bg-success/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-success-foreground hover:bg-success/90"
        >
          Yes, Leave
        </button>
      </div>
    </DialogContent>
  </Dialog>
);
