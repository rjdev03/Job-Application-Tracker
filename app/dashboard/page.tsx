import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board as BoardModel } from "@/lib/models"; 
import { Board } from "@/lib/models/models.types"; 
import { initializeUserBoard } from "@/lib/init-user-board";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoardByUserId(userId: string): Promise<Board | null> {
  await connectDB();
  
  // BoardModel is now the runtime Mongoose model with .findOne()
  const boardDoc = await BoardModel.findOne({
    userId: userId,
    name: "Job Hunt",
  })
    .populate({
      path: "columns",
      populate: { path: "jobApplications" },
    })
    .lean();

  if (!boardDoc) return null;
  
  // Board is now the TypeScript interface type
  return JSON.parse(JSON.stringify(boardDoc)) as Board;
}

async function getOrInitializeBoard(userId: string) {
  let board = await getBoardByUserId(userId);

  if (!board) {
    try {
      await initializeUserBoard(userId);
      board = await getBoardByUserId(userId);
    } catch (error) {
      console.error("Failed to initialize board for user:", userId, error);
      return null;
    }
  }

  return board;
}

async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const board = await getOrInitializeBoard(session.user.id);

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load board. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{board.name}</h1>
          <p className="text-gray-600">Track your Job Applications</p>
        </div>
        <KanbanBoard board={board} userId={session.user.id} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardPage />
    </Suspense>
  );
}