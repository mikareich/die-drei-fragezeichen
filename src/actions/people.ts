'use server'

import { asc, eq, inArray, or, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { EPISODE_SUBQUERY, PEOPLE_SUBQUERY } from '~/db/subqueries'
import { ITEM_LIMIT } from '~/utils/constants'
import { parseEpisodes } from '~/utils/parseEpisodes'
import { parsePerson } from '~/utils/parsePerson'
import type { Person } from '~/utils/types'

export async function getPerson(id: number): Promise<Person | null> {
  'use cache'

  const person = await db
    .select()
    .from(EPISODE_SUBQUERY)
    .where(
      or(
        eq(EPISODE_SUBQUERY.cast.id, id),
        eq(EPISODE_SUBQUERY.bookAuthor.id, id),
        eq(EPISODE_SUBQUERY.scriptAuthor.id, id),
      ),
    )
    .then((raw) => parsePerson(id, parseEpisodes(raw)))

  return person || null
}

const NUMBER_OF_PEOPLE = await db.$count(PEOPLE_SUBQUERY)

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
    const totalPages = Math.max(1, Math.ceil(NUMBER_OF_PEOPLE / limit))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const offset = (currentPage - 1) * limit

    const peopleIDs = await db
      .select({ id: PEOPLE_SUBQUERY.id })
      .from(PEOPLE_SUBQUERY)
      .where(sql`${PEOPLE_SUBQUERY.name} LIKE ${`%${query}%`} COLLATE NOCASE`)
      .orderBy(asc(PEOPLE_SUBQUERY.name))
      .limit(limit)
      .offset(offset)
      .then((data) => data.map(({ id }) => id))

    const people = await db
      .select()
      .from(EPISODE_SUBQUERY)
      .where(
        or(
          inArray(EPISODE_SUBQUERY.cast.id, peopleIDs),
          inArray(EPISODE_SUBQUERY.bookAuthor.id, peopleIDs),
          inArray(EPISODE_SUBQUERY.scriptAuthor.id, peopleIDs),
        ),
      )
      .then((result) => {
        const people = []

        for (const id of peopleIDs) {
          const person = parsePerson(id, parseEpisodes(result))
          people.push(person)
        }

        return people
      })

    return { page: currentPage, people, totalPages }
  } catch (error) {
    console.error(error)

    return null
  }
}
