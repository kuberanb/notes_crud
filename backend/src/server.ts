
import dotenv from "dotenv"

import app from "./app.js";

import { pool } from "./db/pool.js";

dotenv.config()

const result = await pool.query("SELECT NOW()");

console.log(result.rows);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

