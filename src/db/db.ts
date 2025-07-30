import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const path = './public/dreimetadaten.db'
// process.env.NODE_ENV === 'development'
//   ? './public/dreimetadaten.db'
//   : `https://${process.env.VERCEL_URL}/dreimetadaten.db`

const client = createClient({ url: `file:${path}` })
export const db = drizzle(client)
