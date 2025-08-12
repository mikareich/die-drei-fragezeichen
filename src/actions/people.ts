'use server'

import { asc, countDistinct, eq, inArray, or, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { episodes, people } from '~/db/schema'
import { ITEM_LIMIT } from '~/utils/constants'
import { parsePeople, parsePerson } from '~/utils/parsePerson'
import type { Person } from '~/utils/types'

export async function getNumberOfPeople() {
  'use cache'

  const count = await db
    .select({ count: countDistinct(people.id) })
    .from(people)
    .then((data) => Number(data[0].count))

  return count
}

export async function getPerson(id: number): Promise<Person | null> {
  'use cache'

  return db
    .select()
    .from(people)
    .leftJoin(
      episodes,
      or(
        eq(episodes.castPersonId, people.id),
        eq(episodes.bookAuthorId, people.id),
        eq(episodes.scriptAuthorId, people.id),
      ),
    )
    .where(eq(people.id, id))
    .then(parsePerson)
}

type PeopleResults = {
  people: Person[]
  totalPages: number
  page: number
}

export async function getPeopleByQuery(
  query: string,
  page: number,
  limit = ITEM_LIMIT,
): Promise<PeopleResults | null> {
  'use cache'

  try {
    const numberOfPeople = await getNumberOfPeople()
    const totalPages = Math.max(1, Math.ceil(numberOfPeople / limit))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const offset = (currentPage - 1) * limit

    const peopleIds = await db
      .select({ id: people.id })
      .from(people)
      .where(sql`${people.name} LIKE ${`%${query}%`} COLLATE NOCASE`)
      .orderBy(asc(people.name))
      .limit(limit)
      .offset(offset)
      .then((data) => data.map((p) => p.id))

    if (peopleIds.length === 0) {
      return { page: currentPage, people: [], totalPages }
    }

    const peopleData = await db
      .select()
      .from(people)
      .leftJoin(
        episodes,
        or(
          eq(episodes.castPersonId, people.id),
          eq(episodes.bookAuthorId, people.id),
          eq(episodes.scriptAuthorId, people.id),
        ),
      )
      .where(inArray(people.id, peopleIds))
      .orderBy(asc(people.name))
      .then(parsePeople)

    return { page: currentPage, people: peopleData, totalPages }
  } catch (error) {
    console.error(error)
    return null
  }
}
