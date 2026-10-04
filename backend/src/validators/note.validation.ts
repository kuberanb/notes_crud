import { z } from "zod";

const createNoteSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required.")
            .max(200, "Title must not exceed 200 characters."),

        content: z
            .string()
            .max(50000, "Content must not exceed 50000 characters.")
            .optional(),
    })
    .strict();

const updateNoteSchema = createNoteSchema
    .partial()
    .refine(
        (note) =>
            note.title !== undefined || note.content !== undefined,
        {
            message: "Provide title or content to update.",
        },
    );

const idSchema = z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(2147483647));

export function validateNote(
    body: unknown,
    isUpdate = false,
): string | null {
    const schema = isUpdate ? updateNoteSchema : createNoteSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
        return result.error.issues[0]?.message ?? "Invalid input.";
    }

    return null;
}

export function parseId(value: unknown): number | null {
    const result = idSchema.safeParse(value);

    return result.success ? result.data : null;
}