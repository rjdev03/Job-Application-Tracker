"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";

interface CreateColumnInput {
  boardId: string;
  name: string;
  color?: string;
}

interface UpdateColumnInput {
  name?: string;
  color?: string;
}

export async function createColumn(data: CreateColumnInput) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const { boardId, name, color = "cyan" } = data;
    if (!boardId || !name?.trim()) {
      return { error: "Column name is required" };
    }

    await connectDB();

    // Verify user owns the board
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or access denied" };
    }

    // Find the next order value
    const lastColumn = await Column.findOne({ boardId }).sort({ order: -1 }).select("order").lean<{ order: number }>();
    const nextOrder = lastColumn ? lastColumn.order + 1 : 0;

    const column = await Column.create({
      name: name.trim(),
      boardId,
      order: nextOrder,
      color,
      jobApplications: [],
    });

    await Board.findByIdAndUpdate(boardId, {
      $push: { columns: column._id },
    });

    revalidatePath("/dashboard");
    return { data: JSON.parse(JSON.stringify(column)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create column" };
  }
}

export async function updateColumn(columnId: string, boardId: string, updates: UpdateColumnInput) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (!columnId || !boardId) {
      return { error: "Missing required parameters" };
    }

    await connectDB();

    // Verify board belongs to the user
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or access denied" };
    }

    const allowedUpdates: Partial<UpdateColumnInput> = {};
    if (updates.name !== undefined && updates.name.trim().length > 0) {
      allowedUpdates.name = updates.name.trim();
    }
    if (updates.color !== undefined) {
      allowedUpdates.color = updates.color;
    }

    const updatedColumn = await Column.findOneAndUpdate(
      { _id: columnId, boardId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedColumn) {
      return { error: "Column not found" };
    }

    revalidatePath("/dashboard");
    return { data: JSON.parse(JSON.stringify(updatedColumn)) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update column" };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
      return { error: "Board not found or access denied" };
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) {
      return { error: "Column not found or access denied" };
    }

    // Delete all job applications in this column
    await JobApplication.deleteMany({ columnId, userId: session.user.id });
    await Column.deleteOne({ _id: columnId, boardId });
    await Board.updateOne(
      { _id: boardId, userId: session.user.id },
      { $pull: { columns: columnId } }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete column:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete column" };
  }
}