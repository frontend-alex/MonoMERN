import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { TriggerWrapper } from "@/components/shared/trigger-wrapper";

interface DeleteDialogProps {
  icon?: React.ComponentType<{ className?: string }>,
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  buttonText?: string;
  children?: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
}
const DeleteDialog = ({
  onConfirm,
  icon: Icon = Trash,
  title = "Delete Confirmation",
  description = "You're about to permanently delete this item. This action cannot be undone.",
  confirmText = "Confirm Deletion",
  cancelText = "Cancel",
  buttonText = "Delete",
  isLoading = false,
  children,
}: DeleteDialogProps) => {
  return (
    <TriggerWrapper
      customTrigger={children}
      defaultTrigger={
        <Button variant="ghost" size="sm" className="w-full flex-start font-normal hover:text-destructive -ml-[2px] group cursor-pointer">
          <Icon className="mr-[1px] h-4 w-4 text-stone-400 group-hover:text-destructive" />
          {buttonText}
        </Button>
      }
    >
      {({ open, setOpen }) => (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                {cancelText}
              </Button>
              <Button variant="destructive" onClick={(e) => { onConfirm(); setOpen(false); e.stopPropagation() }} disabled={isLoading}>
                {isLoading ? "Deleting..." : confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TriggerWrapper>
  );
}
export default memo(DeleteDialog)