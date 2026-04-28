import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
}

export const ImageViewerModal = ({
  open,
  onClose,
  imageUrl,
  altText,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
}: ImageViewerModalProps) => (
  <Dialog open={open} onOpenChange={(openState) => !openState && onClose()}>
    <DialogContent className="w-full max-w-3xl border-0 bg-black/95 p-0">
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <X size={24} />
        </button>

        {canPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {canNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="flex h-screen max-h-[90vh] w-full items-center justify-center p-8">
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
