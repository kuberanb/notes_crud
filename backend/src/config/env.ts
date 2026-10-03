import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = Number(process.env.PORT) || 5000;


if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

if (!JWT_SECRET || JWT_SECRET.length < 64) {
  throw new Error("JWT SECRET must contain atleast 64 characters")
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT is invalid")
}


export const env = {
  DATABASE_URL,
  JWT_SECRET,
  PORT,
};