import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board as BoardModel } from "@/lib/models"; 
import { Board } from "@/lib/models/models.types"; 
import { initializeUserBoard } from "@/lib/init-user-board";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

async function getBoardByUserId(userId: string): Promise<Board | null> {
  await connectDB();
  const boardDoc = await BoardModel.findOne({ userId })
    .sort({ updatedAt: -1 })
    .populate({
      path: "columns",
      populate: { path: "jobApplications" },
    })
    .lean();

  if (!boardDoc) return null;
  
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 p-4">
        <div className="flex max-w-md flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Failed to load board</h2>
          <p className="text-sm text-gray-600">
            We couldn&#39;t retrieve your job application board. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {board.name}
              </h1>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                Active Board
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Manage and track your job applications across every stage
            </p>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="w-full overflow-x-auto pb-4">
          <KanbanBoard board={board} userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

// Visual Skeleton Loader for Suspense
function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 border-b border-gray-200/80 pb-5">
          <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200 mb-2" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-gray-200" />
        </div>

        {/* Board Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="rounded-xl border border-gray-200 bg-white/60 p-4 h-125 flex flex-col gap-3">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200 mb-2" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}