import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: './public/dreimetadaten.db',
  },
  dialect: 'sqlite',
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
  // schemaFilter: ['serie'],
  // tablesFilter: ['*'],
  verbose: true,
})
