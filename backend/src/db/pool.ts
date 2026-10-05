
import pg from "pg"

import dotenv from "dotenv"

import { env } from "../config/env.js"

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
   connectionString: env.DATABASE_URL
});

pool.on("error", (error) => {
   console.error("Database connection error : ", error);
})

