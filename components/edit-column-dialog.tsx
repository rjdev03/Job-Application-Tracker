"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { COLUMN_COLORS } from "@/lib/column-colors";
import { Column } from "@/lib/models/models.types";
import toast from "react-hot-toast";

interface EditColumnDialogProps {
  column: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateColumn: (columnId: string, updates: { name?: string; color?: string }) => Promise<{ error?: string; data?: Column }>;
}

export default function EditColumnDialog({
  column,
  open,
  onOpenChange,
  onUpdateColumn,
}: EditColumnDialogProps) {
  const [name, setName] = useState(column.name);
  const [selectedColor, setSelectedColor] = useState(column.color || "cyan");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Column name cannot be empty");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const res = await onUpdateColumn(column._id, {
        name: name.trim(),
        color: selectedColor,
      });

      if (res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("Column updated successfully!", { id: toastId });
        onOpenChange(false);
      }
    } catch {
      toast.error("Failed to update column", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:p-6 p-4">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold text-gray-900">Edit Column</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Rename this stage or customize its visual header color
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-column-name" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Column Name *
            </Label>
            <Input
              id="edit-column-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 text-sm border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Header Color
            </Label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {Object.values(COLUMN_COLORS).map((colorItem) => (
                <button
                  type="button"
                  key={colorItem.id}
                  onClick={() => setSelectedColor(colorItem.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                    selectedColor === colorItem.id
                      ? "border-gray-900 ring-2 ring-gray-900/10 bg-gray-50 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full ${colorItem.previewBg}`} />
                  <span className="truncate">{colorItem.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-sm"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm bg-primary font-semibold">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}