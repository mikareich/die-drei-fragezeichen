'use server'

import { asc, countDistinct, eq, inArray, or, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { views } from '~/db/views'
import { ITEM_LIMIT } from '~/utils/constants'
import { parsePeople, parsePerson } from '~/utils/parsePerson'
import type { Person } from '~/utils/types'

export async function getNumberOfPeople() {
  'use cache'

  const count = await db
    .select({ count: countDistinct(views.peopleView.id) })
    .from(views.peopleView)
    .then((data) => Number(data[0].count))

  return count
}

export async function getPerson(id: number): Promise<Person | null> {
  'use cache'

  return db
    .select()
    .from(views.peopleView)
    .leftJoin(
      views.episodeView,
      or(
        eq(views.episodeView.castPersonId, views.peopleView.id),
        eq(views.episodeView.bookAuthorId, views.peopleView.id),
        eq(views.episodeView.scriptAuthorId, views.peopleView.id),
      ),
    )
    .where(eq(views.peopleView.id, id))
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
      .select({ id: views.peopleView.id })
      .from(views.peopleView)
      .where(sql`${views.peopleView.name} LIKE ${`%${query}%`} COLLATE NOCASE`)
      .orderBy(asc(views.peopleView.name))
      .limit(limit)
      .offset(offset)
      .then((data) => data.map((p) => p.id))

    if (peopleIds.length === 0) {
      return { page: currentPage, people: [], totalPages }
    }

    const people = await db
      .select()
      .from(views.peopleView)
      .leftJoin(
        views.episodeView,
        or(
          eq(views.episodeView.castPersonId, views.peopleView.id),
          eq(views.episodeView.bookAuthorId, views.peopleView.id),
          eq(views.episodeView.scriptAuthorId, views.peopleView.id),
        ),
      )
      .where(inArray(views.peopleView.id, peopleIds))
      .orderBy(asc(views.peopleView.name))
      .then(parsePeople)

    return { page: currentPage, people, totalPages }
  } catch (error) {
    console.error(error)
    return null
  }
}
