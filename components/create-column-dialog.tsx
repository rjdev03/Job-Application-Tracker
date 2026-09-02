"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { COLUMN_COLORS } from "@/lib/column-colors";
import { Column } from "@/lib/models/models.types";
import toast from "react-hot-toast";

interface CreateColumnDialogProps {
  onAddColumn: (name: string, color: string) => Promise<{ error?: string; data?: Column }>;
}

export default function CreateColumnDialog({ onAddColumn }: CreateColumnDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("indigo");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a column name");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Adding column...");

    try {
      const res = await onAddColumn(name, selectedColor);
      if (res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success(`Column "${name}" created!`, { id: toastId });
        setName("");
        setSelectedColor("indigo");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to add column", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-11 border-dashed border-2 border-gray-300 hover:border-gray-400 bg-white/70 hover:bg-white text-gray-700 font-semibold px-4 rounded-xl flex items-center gap-2 shadow-xs transition-all"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Add Column</span>
          </Button>
        }
      />
      <DialogContent className="max-w-md sm:p-6 p-4">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold text-gray-900">Add New Column</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Create a custom stage for your job search pipeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="column-name" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Column Name *
            </Label>
            <Input
              id="column-name"
              placeholder="e.g. Technical Screen, Follow-up"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 text-sm border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Theme Color
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
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto text-sm"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm bg-primary font-semibold">
              Create Column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}