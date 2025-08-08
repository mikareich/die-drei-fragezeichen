import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

if (!process.env.DATABASE_URL || !process.env.DATABASE_TOKEN)
  throw new Error('Database credentials not set')

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_TOKEN,
})

export const db = drizzle(client)
