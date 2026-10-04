import { z } from "zod";

const email = z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254);

const registerSchema = z
    .object({
        email,
        password: z
            .string()
            .min(12, "Password must contain at least 12 characters.")
            .max(128),
    })
    .strict();

const loginSchema = z
    .object({
        email,
        password: z
            .string()
            .min(1, "Password is required.")
            .max(128),
    })
    .strict();

export function validateAuth(
    body: unknown,
    isRegistration: boolean,
): string | null {
    const schema = isRegistration ? registerSchema : loginSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
        return result.error.issues[0]?.message ?? "Invalid input.";
    }

    return null;
}