'use client';

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { AlertCircle, Calendar, Edit2, MoreVertical, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import EditColumnDialog from "./edit-column-dialog";
import CreateColumnDialog from "./create-column-dialog";
import { useBoard } from "@/lib/hooks/useBoards";
import { getColumnColor, ColumnColorTheme } from "@/lib/column-colors";
import { closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import toast from "react-hot-toast";

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

interface DroppableColumnProps {
  column: Column;
  config: ColumnColorTheme;
  boardId: string;
  sortedColumns: Column[];
  onUpdateColumn: (columnId: string, updates: { name?: string; color?: string }) => Promise<{ error?: string; data?: Column }>;
  onDeleteColumn: (columnId: string) => Promise<boolean>;
}

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
  onUpdateColumn,
  onDeleteColumn,
}: DroppableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const sortedJobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order);

  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${column.name}"? All job applications inside this column will be permanently removed.`
    );
    if (confirmDelete) {
      const toastId = toast.loading(`Deleting "${column.name}"...`);
      try {
        const success = await onDeleteColumn(column._id);
        if (success) {
          toast.success(`Column "${column.name}" deleted!`, { id: toastId });
        } else {
          toast.error(`Failed to delete column "${column.name}"`, { id: toastId });
        }
      } catch (err) {
        toast.error("An unexpected error occurred", { id: toastId });
        console.log(err);
      }
    }
  };

  return (
    <>
      <Card className={`w-[85vw] max-w-[320px] sm:w-[320px] shrink-0 border-gray-200/80 bg-slate-100/60 shadow-sm transition-all rounded-xl p-0 snap-center sm:snap-align-none ${isOver ? "ring-2 ring-primary/50" : ""}`}>
        <CardHeader className={`${config.color} text-white rounded-t-xl px-4 py-3 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 shrink-0" />
              <CardTitle className="text-white text-sm font-semibold truncate">
                {column.name}
              </CardTitle>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.badgeBg} text-white shrink-0`}>
                {sortedJobs.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-white/20 rounded-md"
                  >
                    <MoreVertical className="h-4 w-4"/>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-3.5 w-3.5"/>
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-medium"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5"/>
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent
          ref={setNodeRef}
          className="space-y-3 p-3 min-h-125 flex flex-col justify-between"
        >
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-0.5">
            <SortableContext
              items={sortedJobs.map((job) => job._id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedJobs.map((job) => (
                <SortableJobCard
                  key={job._id}
                  job={{ ...job, columnId: column._id }}
                  columns={sortedColumns}
                />
              ))}
            </SortableContext>
          </div>
          <div className="pt-2 border-t border-gray-200/60">
            <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
          </div>
        </CardContent>
      </Card>

      <EditColumnDialog
        column={column}
        open={isEditing}
        onOpenChange={setIsEditing}
        onUpdateColumn={onUpdateColumn}
      />
    </>
  );
}

function SortableJobCard({ job, columns } : { job: JobApplication; columns: Column[]}) {
  const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({
    id: job._id,
    data: {
      type: "job",
      job,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <JobApplicationCard
        job={job}
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { columns, error, clearError, moveJob, addColumn, updateColumn, deleteColumn } = useBoard(board);

  const sortedColumns = [...(columns || [])].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  async function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over || !board._id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let draggedJob: JobApplication | null = null;
    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of sortedColumns) {
      const jobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order);
      const jobIndex = jobs.findIndex((j) => j._id === activeId);
      if (jobIndex !== -1) {
        draggedJob = jobs[jobIndex];
        sourceColumn = column;
        sourceIndex = jobIndex;
        break;
      }
    }

    if (!draggedJob || !sourceColumn) return;

    const targetColumn = sortedColumns.find((col) => col._id === overId);
    const targetJob = sortedColumns
      .flatMap((col) => col.jobApplications || [])
      .find((job) => job._id === overId);

    let targetColumnId: string;
    let newIndex: number;

    if (targetColumn) {
      targetColumnId = targetColumn._id;
      const jobsInTarget = [...(targetColumn.jobApplications || [])]
        .filter((j) => j._id !== activeId)
        .sort((a, b) => a.order - b.order);
      newIndex = jobsInTarget.length;
    } else if (targetJob) {
      const targetJobColumn = sortedColumns.find((col) =>
        (col.jobApplications || []).some((j) => j._id === targetJob._id)
      );
      targetColumnId = targetJob.columnId || targetJobColumn?._id || "";

      if (!targetColumnId) return;

      const targetColumnObj = sortedColumns.find((col) => col._id === targetColumnId);
      if (!targetColumnObj) return;

      const allJobsInTargetOriginal = [...(targetColumnObj.jobApplications || [])].sort((a, b) => a.order - b.order);
      const allJobsInTargetFiltered = allJobsInTargetOriginal.filter((j) => j._id !== activeId);

      const targetIndexInOriginal = allJobsInTargetOriginal.findIndex((j) => j._id === overId);
      const targetIndexInFiltered = allJobsInTargetFiltered.findIndex((j) => j._id === overId);

      if (targetIndexInFiltered !== -1) {
        if (sourceColumn._id === targetColumnId) {
          newIndex = sourceIndex < targetIndexInOriginal ? targetIndexInFiltered + 1 : targetIndexInFiltered;
        } else {
          newIndex = targetIndexInFiltered;
        }
      } else {
        newIndex = allJobsInTargetFiltered.length;
      }
    } else {
      return;
    }

    if (sourceColumn._id === targetColumnId && sourceIndex === newIndex) {
      return;
    }

    try {
      await moveJob(activeId, targetColumnId, newIndex);
    } catch (err) {
      console.error("Failed to move job application:", err);
      toast.error("Failed to move application");
    }
  }

  const activeJob = sortedColumns
    .flatMap((col) => col.jobApplications || [])
    .find((job) => job._id === activeId);

  return (
    <DndContext
      id="kanban-dnd-context"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs sm:text-sm font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/20" onClick={clearError}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="flex gap-4 items-start overflow-x-auto pb-6 snap-x snap-mandatory sm:snap-none scrollbar-thin scrollbar-thumb-gray-300">
          {sortedColumns.map((col, index) => {
            const config = getColumnColor(col.color, index);
            return (
              <DroppableColumn
                key={col._id}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
              />
            );
          })}

          {/* Add Column Button Card */}
          <div className="w-[85vw] max-w-60 sm:w-60 shrink-0 pt-1">
            <CreateColumnDialog onAddColumn={addColumn} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="opacity-95 rotate-1 shadow-2xl rounded-xl">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}