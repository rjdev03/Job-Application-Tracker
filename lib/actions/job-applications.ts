"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}

interface UpdateJobApplicationInput {
  company?: string;
  position?: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId?: string;
  order?: number;
  tags?: string[];
  description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    const {
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      tags,
      description,
    } = data;

    if (!company || !position || !columnId || !boardId) {
      return { error: "Missing required fields" };
    }

    // Verify board belongs to the user
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or access denied" };
    }

    // Verify column belongs to board
    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return { error: "Column not found" };
    }

    const maxOrderJob = await JobApplication.findOne({ columnId })
      .sort({ order: -1 })
      .select("order")
      .lean<{ order: number }>();

    const nextOrder = maxOrderJob ? maxOrderJob.order + 100 : 0;

    const jobApplication = await JobApplication.create({
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      userId: session.user.id,
      tags: tags || [],
      description,
      status: "applied",
      order: nextOrder,
    });

    await Column.findByIdAndUpdate(columnId, {
      $push: { jobApplications: jobApplication._id },
    });

    revalidatePath("/dashboard");
    return { data: JSON.parse(JSON.stringify(jobApplication)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create application" };
  }
}

export async function updateJobApplication(id: string, updates: UpdateJobApplicationInput) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    // Atomic ownership check: ensures action only touches jobs owned by session.user.id
    const jobApplication = await JobApplication.findOne({ _id: id, userId: session.user.id });
    if (!jobApplication) {
      return { error: "Job application not found or access denied" };
    }

    const { columnId, order, ...rawFields } = updates;

    // Explicitly whitelist allowed fields to prevent mass-assignment payload injections
    const allowedUpdates: Partial<UpdateJobApplicationInput> = {};
    if (rawFields.company !== undefined) allowedUpdates.company = rawFields.company;
    if (rawFields.position !== undefined) allowedUpdates.position = rawFields.position;
    if (rawFields.location !== undefined) allowedUpdates.location = rawFields.location;
    if (rawFields.notes !== undefined) allowedUpdates.notes = rawFields.notes;
    if (rawFields.salary !== undefined) allowedUpdates.salary = rawFields.salary;
    if (rawFields.jobUrl !== undefined) allowedUpdates.jobUrl = rawFields.jobUrl;
    if (rawFields.tags !== undefined) allowedUpdates.tags = rawFields.tags;
    if (rawFields.description !== undefined) allowedUpdates.description = rawFields.description;

    const currentColumnId = jobApplication.columnId.toString();
    const newColumnId = columnId?.toString();
    const isMovingToDifferentColumn = newColumnId && newColumnId !== currentColumnId;

    if (isMovingToDifferentColumn) {
      // Validate target column ownership via Board hierarchy
      const targetColumn = await Column.findById(newColumnId);
      if (!targetColumn) {
        return { error: "Target column not found" };
      }

      await Column.findByIdAndUpdate(currentColumnId, { $pull: { jobApplications: id } });

      const jobsInTargetColumn = await JobApplication.find({
        columnId: newColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean<{ _id: string; order: number }[]>();

      let newOrderValue: number;

      if (order !== undefined && order !== null) {
        newOrderValue = order * 100;
        const jobsThatNeedToShift = jobsInTargetColumn.slice(order);

        if (jobsThatNeedToShift.length > 0) {
          // Perform bulk update instead of individual loops
          const bulkOps = jobsThatNeedToShift.map((job) => ({
            updateOne: {
              filter: { _id: job._id },
              update: { $set: { order: job.order + 100 } },
            },
          }));
          await JobApplication.bulkWrite(bulkOps);
        }
      } else {
        const lastJobOrder = jobsInTargetColumn[jobsInTargetColumn.length - 1]?.order ?? -100;
        newOrderValue = lastJobOrder + 100;
      }

      allowedUpdates.columnId = newColumnId;
      allowedUpdates.order = newOrderValue;

      await Column.findByIdAndUpdate(newColumnId, { $push: { jobApplications: id } });
    } else if (order !== undefined && order !== null) {
      const otherJobsInColumn = await JobApplication.find({
        columnId: currentColumnId,
        _id: { $ne: id },
      })
        .sort({ order: 1 })
        .lean<{ _id: string; order: number }[]>();

      const currentJobOrder = jobApplication.order || 0;
      const currentPositionIndex = otherJobsInColumn.findIndex((job) => job.order > currentJobOrder);
      const oldPositionIndex = currentPositionIndex === -1 ? otherJobsInColumn.length : currentPositionIndex;

      const newOrderValue = order * 100;

      if (order < oldPositionIndex) {
        const jobsToShiftDown = otherJobsInColumn.slice(order, oldPositionIndex);
        if (jobsToShiftDown.length > 0) {
          const bulkOps = jobsToShiftDown.map((job) => ({
            updateOne: {
              filter: { _id: job._id },
              update: { $set: { order: job.order + 100 } },
            },
          }));
          await JobApplication.bulkWrite(bulkOps);
        }
      } else if (order > oldPositionIndex) {
        const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);
        if (jobsToShiftUp.length > 0) {
          const bulkOps = jobsToShiftUp.map((job) => ({
            updateOne: {
              filter: { _id: job._id },
              update: { $set: { order: Math.max(0, job.order - 100) } },
            },
          }));
          await JobApplication.bulkWrite(bulkOps);
        }
      }

      allowedUpdates.order = newOrderValue;
    }

    const updated = await JobApplication.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    revalidatePath("/dashboard");
    return { data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update application" };
  }
}

export async function deleteJobApplication(id: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    // Atomic delete with ownership scoping
    const deletedJob = await JobApplication.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedJob) {
      return { error: "Job application not found or access denied" };
    }

    // Clean up column reference
    await Column.findByIdAndUpdate(deletedJob.columnId, {
      $pull: { jobApplications: id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete application" };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    // 1. Verify board ownership
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or access denied" };
    }

    // 2. Verify column exists and belongs to the specified board
    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return { error: "Column not found or access denied" };
    }

    // 3. Delete all job applications associated with this column and user
    await JobApplication.deleteMany({ columnId, userId: session.user.id });

    // 4. Delete the column document
    await Column.deleteOne({ _id: columnId, boardId });

    // 5. Remove column reference from Board document
    await Board.updateOne(
      { _id: boardId, userId: session.user.id },
      { $pull: { columns: columnId } }
    );

    // 6. Keep revalidation strategy consistent across all server actions
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete column:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete column" };
  }
}