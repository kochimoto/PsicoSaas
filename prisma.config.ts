import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isCli = process.argv.some(arg => arg.includes('prisma'));

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: isCli ? env("DIRECT_URL") : env("DATABASE_URL")
  },
});
