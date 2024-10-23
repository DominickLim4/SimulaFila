import { config } from "dotenv";

import { defineConfig } from "drizzle-kit";

console.log('TURSO_CONNECTION_URL:', process.env.TURSO_CONNECTION_URL);

config({ path: ".env" });

export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
