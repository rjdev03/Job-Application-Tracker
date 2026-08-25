"use client";

import { useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication, deleteColumn } from "../actions/job-applications";

export function useBoard(initialBoard?: Board | null) {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [prevInitialBoard, setPrevInitialBoard] = useState<Board | null | undefined>(initialBoard);
  const [error, setError] = useState<string | null>(null);

  if (initialBoard !== prevInitialBoard) {
    setPrevInitialBoard(initialBoard);
    setBoard(initialBoard || null);
    setColumns(initialBoard?.columns || []);
  }

  const clearError = () => setError(null);

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number
  ) {
    setError(null);
    // Deep clone state to preserve accurate rollback targets
    const previousColumns = JSON.parse(JSON.stringify(columns)) as Column[];

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        jobApplications: [...(col.jobApplications || [])],
      }));

      let jobToMove: JobApplication | null = null;
      let oldColumnId: string | null = null;

      for (const col of newColumns) {
        const jobIndex = col.jobApplications.findIndex(
          (j) => j._id === jobApplicationId
        );
        if (jobIndex !== -1) {
          jobToMove = col.jobApplications[jobIndex];
          oldColumnId = col._id;
          col.jobApplications = col.jobApplications.filter(
            (job) => job._id !== jobApplicationId
          );
          break;
        }
      }

      if (jobToMove && oldColumnId) {
        const targetColumnIndex = newColumns.findIndex(
          (col) => col._id === newColumnId
        );
        if (targetColumnIndex !== -1) {
          const targetColumn = newColumns[targetColumnIndex];
          const currentJobs = targetColumn.jobApplications || [];

          const updatedJobs = [...currentJobs];
          updatedJobs.splice(newOrder, 0, {
            ...jobToMove,
            columnId: newColumnId,
            order: newOrder * 100,
          });

          const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
            ...job,
            order: idx * 100,
          }));

          newColumns[targetColumnIndex] = {
            ...targetColumn,
            jobApplications: jobsWithUpdatedOrders,
          };
        }
      }

      return newColumns;
    });

    try {
      const result = await updateJobApplication(jobApplicationId, {
        columnId: newColumnId,
        order: newOrder,
      });

      if (result && "error" in result && result.error) {
        setColumns(previousColumns);
        setError(result.error);
        return false;
      }
      return true;
    } catch (err) {
      setColumns(previousColumns);
      setError("Failed to update job position. Changes reverted.");
      console.error("Error moving job:", err);
      return false;
    }
  }

  async function handleDeleteColumn(columnId: string) {
    if (!board?._id) {
      setError("Board context missing");
      return false;
    }

    setError(null);
    const previousColumns = JSON.parse(JSON.stringify(columns)) as Column[];

    setColumns((prev) => prev.filter((col) => col._id !== columnId));

    try {
      const result = await deleteColumn(columnId, board._id);

      if (result && "error" in result && result.error) {
        setColumns(previousColumns);
        setError(result.error);
        return false;
      }
      return true;
    } catch (err) {
      setColumns(previousColumns);
      setError("Failed to delete column. Changes reverted.");
      console.error("Error deleting column:", err);
      return false;
    }
  }

  return { 
    board, 
    columns, 
    error, 
    clearError, 
    moveJob, 
    deleteColumn: handleDeleteColumn 
  };
}