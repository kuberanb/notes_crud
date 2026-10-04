
import dotenv from "dotenv"
import app from "./app.js";
import { pool } from "./db/pool.js";
import { env } from "./config/env.js";

dotenv.config()

const result = await pool.query("SELECT NOW()");

console.log(result.rows);

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

