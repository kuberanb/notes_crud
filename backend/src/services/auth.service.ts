import argon2 from "argon2";
import { pool } from "../db/pool.js";
import { createToken } from "./token.service.js";

type User = {
    id: number;
    email: string;
}

type LoginUser = User & {
    password_hash: string;
}


export async function register(email: string, password: string): Promise<User>  {

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    const result = await pool.query<User>(`INSERT INTO users (email, password_hash) VALUES($1, $2) RETURNING id, email`, [email, passwordHash])

    const user = result.rows[0];

    if (!user) {
        throw new Error("User creation failed");
    }

    return user;

}


export async function login(email: string, password: string) {

    const result = await pool.query<LoginUser>(`SELECT id, email, password_hash FROM users WHERE email = $1`, [email]);

    const user = result.rows[0]

    if (!user || !(await argon2.verify(user.password_hash, password))) {
        return null;
    }

    return {
        user: {

        },
        acessToken: createToken(user.id)
    }

}