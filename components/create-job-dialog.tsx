"use client"

import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { createJobApplication } from "@/lib/actions/job-applications";

interface CreateJobApplicationDialogProps {
  columnId: string;
  boardId: string;
}

const INITIAL_FORM_DATA = {
  company: "",
  position: "",
  location: "",
  notes: "",
  salary: "",
  jobUrl: "",
  tags: "",
  description: "",
};

export default function CreateJobApplicationDialog({ columnId, boardId} : CreateJobApplicationDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const toastId = toast.loading("Adding job application...");

    try {
      const result = await createJobApplication({
        ...formData,
        columnId,
        boardId,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      });

      if (!result.error) {
        toast.success(`Application for ${formData.company} added!`, { id: toastId });
        setFormData(INITIAL_FORM_DATA);
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to create job application", { id: toastId });
      }
    } catch(err) {
      toast.error("An unexpected error occurred", { id: toastId });
      console.error(err)
    }
  }

  return(
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="outline"
            className="w-full justify-center text-xs font-semibold text-gray-600 border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-white hover:text-gray-900 transition-all h-9 rounded-lg"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5"/>
            Add Job
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">Add Job Application</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Track a new job application in your pipeline
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Company *
                </Label>
                <Input 
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})} 
                  required 
                  className="h-10 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Position *
                </Label>
                <Input 
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})} 
                  required 
                  className="h-10 text-sm border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Location
                </Label>
                <Input 
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="h-10 text-sm border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Salary
                </Label>
                <Input 
                  id="salary" 
                  placeholder="e.g., $100k - $150k"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="h-10 text-sm border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jobUrl" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Job URL
              </Label>
              <Input 
                id="jobUrl" 
                placeholder="https://..."
                value={formData.jobUrl}
                onChange={(e) => setFormData({...formData, jobUrl: e.target.value})}
                className="h-10 text-sm border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Tags (comma separated)
              </Label>
              <Input 
                id="tags" 
                placeholder="React, Tailwind, High Pay"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="h-10 text-sm border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Brief description of the role..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="text-sm border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Notes
              </Label>
              <Textarea 
                id="notes" 
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="text-sm border-gray-200"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto text-sm bg-primary font-semibold">
              Add Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}