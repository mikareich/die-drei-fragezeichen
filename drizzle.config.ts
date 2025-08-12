import { defineConfig } from 'drizzle-kit'
import { Resource } from 'sst'

export default defineConfig({
  dbCredentials: {
    url: Resource.DATABASE_URL.value,
    authToken: Resource.DATABASE_TOKEN.value,
  },
  dialect: 'turso',
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
})
