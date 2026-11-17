import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Les migrations utilisent l'URL directe (sans pooler).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
