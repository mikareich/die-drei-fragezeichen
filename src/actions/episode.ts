'use server'

import { countDistinct, eq, inArray, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { views } from '~/db/views'
import { ITEM_LIMIT } from '~/utils/constants'
import { parseEpisode, parseEpisodes } from '~/utils/parseEpisode'
import type { Episode } from '~/utils/types'

export async function getNumberOfEpisodes() {
  'use cache'

  const count = await db
    .select({ count: countDistinct(views.episodeView.number) })
    .from(views.episodeView)
    .then((data) => Number(data[0].count))

  return count
}

export async function getEpisodeByNumber(
  episodeNumber: number,
): Promise<Episode | null> {
  'use cache'

  return db
    .select()
    .from(views.episodeView)
    .where(eq(views.episodeView.number, episodeNumber))
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
        id: views.episodeView.episodeId,
      })
      .from(views.episodeView)
      .where(
        sql`${views.episodeView.title} LIKE ${`%${query}%`} COLLATE NOCASE`,
      )
      .limit(limit)
      .offset(offset)
      .then((data) => data.map(({ id }) => id))

    const episodes = await db
      .select()
      .from(views.episodeView)
      .where(inArray(views.episodeView.episodeId, episodeIDs))
      .then(parseEpisodes)

    return { episodes, page: currentPage, totalPages }
  } catch (e) {
    console.error(e)
    return null
  }
}
