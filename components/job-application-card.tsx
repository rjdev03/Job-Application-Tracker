"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2, MapPin, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-applications";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export interface JobApplicationCardProps {
  job: JobApplication;
  columns: Column[];
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

function getSafeExternalUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // Block dangerous pseudo-protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  // Prepend https:// if user omitted protocol scheme
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getInitialFormData(job: JobApplication) {
  return {
    company: job.company,
    position: job.position,
    location: job.location || "",
    notes: job.notes || "",
    salary: job.salary || "",
    jobUrl: job.jobUrl || "",
    columnId: job.columnId || "",
    tags: job.tags?.join(", ") || "",
    description: job.description || "",
  };
}

export default function JobApplicationCard({ job, columns, dragHandleProps }: JobApplicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData(job));

  const safeJobUrl = getSafeExternalUrl(job.jobUrl);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFormData(getInitialFormData(job));
    }
    setIsEditing(open);
  };

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await updateJobApplication(job._id, {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      });

      if (!result.error) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update job application", err);
    }
  }

  async function handleDelete() {
    try {
      const result = await deleteJobApplication(job._id);

      if (result.error) {
        console.error("Failed to delete job application: ", result.error);
      }
    } catch (err) {
      console.error("Failed to delete job application", err);
    }
  }

  async function handleMove(newColumnId: string) {
    try {
      await updateJobApplication(job._id, {
        columnId: newColumnId,
      });
    } catch (err) {
      console.error("Failed to move job application", err);
    }
  }

  return (
    <>
      <Card 
      {...dragHandleProps} 
      className="group relative border border-gray-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:border-gray-300 rounded-lg cursor-grab active:cursor-grabbing select-none touch-none">
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-gray-900 leading-snug truncate">{job.position}</h3>
              <p className="text-xs font-medium text-gray-600 mt-0.5 truncate">{job.company}</p>
              
              {job.description && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              )}

              {(job.location || job.salary) && (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-0.5 truncate">
                      <DollarSign className="h-3 w-3 shrink-0 text-gray-400" />
                      {job.salary}
                    </span>
                  )}
                </div>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {safeJobUrl && (
                <a
                href={safeJobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-2"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}>
                  <span>Listing</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-slate-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => handleOpenChange(true)} className="cursor-pointer text-xs">
                    <Edit2 className="mr-2 h-3.5 w-3.5" />
                    Edit Application
                  </DropdownMenuItem>
                  {columns.length > 1 && (
                    <>
                      {columns
                        .filter((c) => c._id !== job.columnId)
                        .map((column) => (
                          <DropdownMenuItem 
                            key={column._id}
                            onClick={() => handleMove(column._id)}
                            className="cursor-pointer text-xs">
                            Move to {column.name}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-medium"
                    onClick={() => handleDelete()}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
          <DialogHeader className="pb-2 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Job Application</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update details for this job application
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-4 pt-2" onSubmit={handleUpdate}>
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
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto text-sm"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto text-sm bg-primary font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}