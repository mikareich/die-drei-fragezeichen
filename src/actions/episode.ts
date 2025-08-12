'use server'

import { countDistinct, eq, inArray, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { episodes } from '~/db/schema'
import { ITEM_LIMIT } from '~/utils/constants'
import { parseEpisode, parseEpisodes } from '~/utils/parseEpisode'
import type { Episode } from '~/utils/types'

export async function getNumberOfEpisodes() {
  'use cache'

  const count = await db
    .select({ count: countDistinct(episodes.number) })
    .from(episodes)
    .then((data) => Number(data[0].count))

  return count
}

export async function getEpisodeByNumber(
  episodeNumber: number,
): Promise<Episode | null> {
  'use cache'

  return db
    .select()
    .from(episodes)
    .where(eq(episodes.number, episodeNumber))
    .then(parseEpisode)
}

type EpisodeResults = {
  episodes: Episode[]
  totalPages: number
  page: number
}

export async function getEpisodesByQuery(
  query: string,
  page: number,
  limit = ITEM_LIMIT,
): Promise<EpisodeResults | null> {
  'use cache'

  try {
    const numberOfEpisodes = await getNumberOfEpisodes()
    const totalPages = Math.max(1, Math.ceil(numberOfEpisodes / limit))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const offset = (currentPage - 1) * limit

    const episodeIDs = await db
      .selectDistinct({
        id: episodes.episodeId,
      })
      .from(episodes)
      .where(sql`${episodes.title} LIKE ${`%${query}%`} COLLATE NOCASE`)
      .limit(limit)
      .offset(offset)
      .then((data) => data.map(({ id }) => id))

    const episodes = await db
      .select()
      .from(episodes)
      .where(inArray(episodes.episodeId, episodeIDs))
      .then(parseEpisodes)

    return { episodes, page: currentPage, totalPages }
  } catch (e) {
    console.error(e)
    return null
  }
}
