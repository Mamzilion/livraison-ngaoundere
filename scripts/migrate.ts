// Applique les migrations SQL du dossier ./drizzle (lancé automatiquement au build sur Vercel).
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant : migrations ignorées.");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
migrate(drizzle(client), { migrationsFolder: "./drizzle" })
  .then(() => console.log("Migrations appliquées."))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
