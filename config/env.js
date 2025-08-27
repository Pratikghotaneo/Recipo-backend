import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  JWT_SECRET,
  GOOGLE_API_KEY,
  UNSPLASH_ACCESS_KEY,
  UNSPLASH_SECRET_KEY,
} = process.env;
