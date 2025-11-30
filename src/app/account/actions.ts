'use server'

import { desc, eq } from 'drizzle-orm'
import { db } from '~/db/db'
import { metadata, series, versions } from '~/db/schema'

/** Fetches current version of dataset and newest version dataset on dreimetadaten.de */
export async function getDatasetVersions() {
  // get db versions
  const localVersion = await db
    .select()
    .from(versions)
    .orderBy(desc(versions.date))
    .limit(1)
    .then(([{ major, minor, patch }]) => `${major}.${minor}.${patch}`)

  const newestVersionResponse = await fetch(
    'https://dreimetadaten.de/data/Serie.json',
  )
  const newestVersion =
    (await newestVersionResponse.json())?.dbInfo?.version || localVersion

  return { localVersion, newestVersion }
}

export async function getMissingEpisodes() {
  return db
    .select({ number: series.number, title: metadata.title })
    .from(metadata)
    .innerJoin(series, eq(series.episodeID, metadata.episodeID))
}
