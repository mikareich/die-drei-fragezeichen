import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    token: process.env.DATABASE_TOKEN as string,
  },
  dialect: 'sqlite',
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
})
