import connectDB from "./db";
import { Board, Column } from "./models";

const DEFAULT_COLUMNS = [
    {
        name: "Wish List",
        order: 0,
        color: "cyan",
    },
    {
        name: "Applied",
        order: 1,
        color: "purple",
    },
    {
        name: "Interviewing",
        order: 2,
        color: "emerald",
    },
    {
        name: "Offer",
        order: 3,
        color: "amber",
    },
    {
        name: "Rejected",
        order: 4,
        color: "rose",
    },
];

export async function initializeUserBoard(userId: string) {
    try {
        await connectDB();

        // Check if board already exists
        const existingBoard = await Board.findOne({ userId, name: "Job Hunt"});

        if (existingBoard) {
            return existingBoard;
        }

        // Create the Board
        const board = await Board.create(
            {
                name: "Job Hunt",
                userId,
                columns: [],
            }
        );

        //Create default columns
        const columns = await Promise.all(
            DEFAULT_COLUMNS.map(
                (col) => Column.create({
                    name: col.name,
                    order: col.order,
                    color: col.color,
                    boardId: board._id,
                    jobApplications: [],
                })
            )
        );

        // Update the board with the new column IDs
        board.columns = columns.map((col) => col._id);
        await board.save();

        return board;
    } catch (error) {
        throw error;
    }
}