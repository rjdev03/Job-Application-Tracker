'use client';

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { AlertCircle, Award, Calendar, CheckCircle, Mic, MoreVertical, Trash2, X, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoards";
import { closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

interface ColConfig {
  color: string; 
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: "bg-cyan-500",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    color: "bg-purple-500",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    color: "bg-green-500",
    icon: <Mic className="h-4 w-4"/>,
  },
  {
    color: "bg-yellow-500",
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: "bg-red-500",
    icon: <XCircle className="h-4 w-4" />,
  },
];

interface DroppableColumnProps {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
  onDeleteColumn: (columnId: string) => Promise<boolean>;
}

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
  onDeleteColumn,
}: DroppableColumnProps) {
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
      try {
        const success = await onDeleteColumn(column._id);
        if (!success) {
          alert(`Failed to delete column "${column.name}". Please try again.`);
        }
      } catch (err) {
        console.error("Failed to execute column deletion:", err);
        alert("An unexpected error occurred while deleting the column.");
      }
    }
  };

  return (
    <Card className="min-w-75 shrink-0 shadow-md p-0">
      <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button  
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4"/>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4"/>
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef} 
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-100 rounded-b-lg ${isOver ? "ring-2 ring-blue-500" : ""}`}
      >
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
        <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
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
    opacity: isDragging ? 0.5 : 1,
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
  const { columns, error, clearError, moveJob, deleteColumn } = useBoard(board);

  const sortedColumns = [...(columns || [])].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
    let newOrder: number;

    if (targetColumn) {
      targetColumnId = targetColumn._id;
      const jobsInTarget = [...(targetColumn.jobApplications || [])]
        .filter((j) => j._id !== activeId)
        .sort((a, b) => a.order - b.order);
      newOrder = jobsInTarget.length;
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
          if (sourceIndex < targetIndexInOriginal) {
            newOrder = targetIndexInFiltered + 1;
          } else {
            newOrder = targetIndexInFiltered;
          }
        } else {
          newOrder = targetIndexInFiltered;
        }
      } else {
        newOrder = allJobsInTargetFiltered.length;
      }
    } else {
      return;
    }

    if (!targetColumnId) {
      return;
    }

    try {
      await moveJob(activeId, targetColumnId, newOrder);
    } catch (err) {
      console.error("Failed to move job:", err);
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
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={clearError}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedColumns.map((col, index) => {
            const config = COLUMN_CONFIG[index] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={col._id}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
                onDeleteColumn={deleteColumn}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="opacity-50">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}