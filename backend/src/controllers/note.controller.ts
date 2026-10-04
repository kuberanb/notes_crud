

import type { Response } from "express";
import type { AuthRequest } from "../services/token.service.js";
import * as noteService from "../services/note.service.js";
import {
    validateNote,
    parseId,
} from "../validators/note.validation.js";

// All handlers must run after authentication in note.routes.ts.

export async function create(req: AuthRequest, res: Response) {
    const message = validateNote(req.body);

    if (message) {
        res.status(400).json({
            status: false,
            message,
            data: null,
        });
        return;
    }

    const { title, content = "" } = req.body as {
        title: string;
        content?: string;
    };

    try {
        const note = await noteService.create(
            req.userId!,
            title.trim(),
            content,
        );

        res.status(201).json({
            status: true,
            message: "Note created.",
            data: note,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "Could not create note.",
            data: null,
        });
    }
}

export async function list(req: AuthRequest, res: Response) {
    const page =
        req.query.page === undefined ? 1 : parseId(req.query.page);

    if (page === null || page > 10000) {
        res.status(400).json({
            status: false,
            message: "Page must be between 1 and 10000.",
            data: null,
        });
        return;
    }

    try {
        const notes = await noteService.list(req.userId!, page);

        res.json({
            status: true,
            message: "Notes fetched.",
            data: { notes, page, pageSize: 20 },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "Could not fetch notes.",
            data: null,
        });
    }
}

export async function get(req: AuthRequest, res: Response) {
    const noteId = parseId(req.params.id);

    if (noteId === null) {
        res.status(400).json({
            status: false,
            message: "Invalid note ID.",
            data: null,
        });
        return;
    }

    try {
        const note = await noteService.get(req.userId!, noteId);

        res.status(note ? 200 : 404).json({
            status: note !== null,
            message: note ? "Note fetched." : "Note not found.",
            data: note,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "Could not fetch note.",
            data: null,
        });
    }
}

export async function update(req: AuthRequest, res: Response) {
    const noteId = parseId(req.params.id);

    if (noteId === null) {
        res.status(400).json({
            status: false,
            message: "Invalid note ID.",
            data: null,
        });
        return;
    }

    const message = validateNote(req.body, true);

    if (message) {
        res.status(400).json({
            status: false,
            message,
            data: null,
        });
        return;
    }

    const { title, content } = req.body as {
        title?: string;
        content?: string;
    };

    try {
        const note = await noteService.update(
            req.userId!,
            noteId,
            title?.trim(),
            content,
        );

        res.status(note ? 200 : 404).json({
            status: note !== null,
            message: note ? "Note updated." : "Note not found.",
            data: note,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "Could not update note.",
            data: null,
        });
    }
}

export async function remove(req: AuthRequest, res: Response) {
    const noteId = parseId(req.params.id);

    if (noteId === null) {
        res.status(400).json({
            status: false,
            message: "Invalid note ID.",
            data: null,
        });
        return;
    }

    try {
        const deleted = await noteService.remove(req.userId!, noteId);

        res.status(deleted ? 200 : 404).json({
            status: deleted,
            message: deleted ? "Note deleted." : "Note not found.",
            data: null,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: "Could not delete note.",
            data: null,
        });
    }
}