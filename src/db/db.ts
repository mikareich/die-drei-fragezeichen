import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const path = './src/db/dreimetadaten.db'

const client = createClient({ url: `file:${path}` })
export const db = drizzle(client)
