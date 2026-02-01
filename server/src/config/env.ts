import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/google-docs-clone"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
