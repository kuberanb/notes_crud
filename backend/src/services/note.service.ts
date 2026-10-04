import { pool } from "../db/pool.js";

type Note = {
    id: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
};

export async function create(
    userId: number,
    title: string,
    content: string,
) {
    const result = await pool.query<Note>(
        `INSERT INTO notes (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING id, title, content, created_at, updated_at`,
        [userId, title, content],
    );

    const note = result.rows[0];

    if (!note) {
        throw new Error("Note creation failed.");
    }

    return note;
}

export async function list(userId: number, page: number) {
    const result = await pool.query<Note>(
        `SELECT id, title, content, created_at, updated_at
     FROM notes
     WHERE user_id = $1
     ORDER BY id DESC
     LIMIT 20 OFFSET $2`,
        [userId, (page - 1) * 20],
    );

    return result.rows;
}

export async function get(userId: number, noteId: number) {
    const result = await pool.query<Note>(
        `SELECT id, title, content, created_at, updated_at
     FROM notes
     WHERE id = $1 AND user_id = $2`,
        [noteId, userId],
    );

    return result.rows[0] ?? null;
}

export async function update(
    userId: number,
    noteId: number,
    title?: string,
    content?: string,
) {
    const result = await pool.query<Note>(
        `UPDATE notes
     SET title = COALESCE($3::text, title),
         content = COALESCE($4::text, content),
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, content, created_at, updated_at`,
        [noteId, userId, title ?? null, content ?? null],
    );

    return result.rows[0] ?? null;
}

export async function remove(userId: number, noteId: number) {
    const result = await pool.query(
        "DELETE FROM notes WHERE id = $1 AND user_id = $2",
        [noteId, userId],
    );

    return result.rowCount === 1;
}