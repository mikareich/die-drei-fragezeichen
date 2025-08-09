import { countDistinct } from 'drizzle-orm'
import { db } from '~/db/db'
import { schema } from '~/db/schema'
import { PEOPLE_SUBQUERY } from '~/db/subqueries'

export const ITEM_LIMIT = 10

export const QUERY_DEBOUNCE = 200

export const LOC_NA_CONTENT = 'Keine Angaben.'

export const NUMBER_OF_EPISODES = await db
  .select({
    count: countDistinct(schema.series.number),
  })
  .from(schema.series)
  .then((data) => Number(data[0].count))

export const NUMBER_OF_PEOPLE = await db.$count(PEOPLE_SUBQUERY)
