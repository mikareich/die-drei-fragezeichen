'use server'

import { eq, inArray, or, sql } from 'drizzle-orm'
import { db } from '~/db/db'
import { schema } from '~/db/schema'
import { EPISODE_SUBQUERY } from '~/db/subqueries'
import { ITEM_LIMIT, NUMBER_OF_EPISODES } from '~/utils/constants'
import { parseEpisodes } from '~/utils/parseEpisodes'
import type { Episode } from '~/utils/types'

/** Returns episode by ep number */
export async function getEpisodeByNumber(
  episodeNumber: number,
): Promise<Episode | null> {
  'use cache'

  const episodes = await db
    .select()
    .from(EPISODE_SUBQUERY)
    .where(
      or(
        eq(EPISODE_SUBQUERY.metadata.number, episodeNumber),
        inArray(
          EPISODE_SUBQUERY.metadata.id,
          db
            .select({ id: schema.part.part })
            .from(schema.part)
            .innerJoin(
              schema.series,
              eq(schema.part.episodeID, schema.series.episodeID),
            )
            .where(eq(schema.series.number, episodeNumber)),
        ),
      ),
    )
    .then(parseEpisodes)

  return episodes.at(0) || null
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
    const totalPages = Math.max(1, Math.ceil(NUMBER_OF_EPISODES / limit))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const offset = (currentPage - 1) * limit

    const episodeIDs = await db
      .selectDistinct({
        id: schema.metadata.episodeID,
      })
      .from(schema.metadata)
      .innerJoin(
        schema.series,
        eq(schema.series.episodeID, schema.metadata.episodeID),
      )
      .where(sql`${schema.metadata.title} LIKE ${`%${query}%`} COLLATE NOCASE`)
      .limit(limit)
      .offset(offset)
      .then((data) => data.map(({ id }) => id))

    const episodes = await db
      .select()
      .from(EPISODE_SUBQUERY)
      .where(inArray(EPISODE_SUBQUERY.metadata.id, episodeIDs))
      .then(parseEpisodes)

    return { episodes, page: currentPage, totalPages }
  } catch (e) {
    console.error(e)
    return null
  }
}
