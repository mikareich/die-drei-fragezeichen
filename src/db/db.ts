import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { Resource } from 'sst'

const DATABASE_URL = Resource.DATABASE_URL.value
const DATABASE_TOKEN = Resource.DATABASE_TOKEN.value

if (!DATABASE_URL || !DATABASE_TOKEN)
  throw new Error('Database credentials not set')

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_TOKEN,
})

export const db = drizzle(client)
