'use server'

import { InvokeCommand } from '@aws-sdk/client-lambda'
import { desc, eq } from 'drizzle-orm'
import { Resource } from 'sst'
import type { z } from 'zod'
import type {
  getUploadURLForAudio,
  getUploadURLForAudio_REQUEST_SCHEMA,
} from '~/../functions/audio'
import { db } from '~/db/db'
import { metadata, series, version } from '~/db/schema'
import { lambda, parseLambdaResponse } from '~/utils/aws'

/** Fetches current version of dataset and newest version dataset on dreimetadaten.de */
export async function getDatasetVersions() {
  // get db versions
  const localVersion = await db
    .select()
    .from(version)
    .orderBy(desc(version.date))
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

export async function getUploadURL(episodeNumber: number, part: number) {
  try {
    const payload = {
      body: { episodeNumber, part } satisfies z.infer<
        typeof getUploadURLForAudio_REQUEST_SCHEMA
      >,
    }

    const invokeCommand = new InvokeCommand({
      FunctionName: Resource.GetUploadURLForAudio.name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload)),
    })

    const response = await lambda.send(invokeCommand)

    const result = parseLambdaResponse(response.Payload)
    if (!result) throw new Error('Could not parse lambda response')

    return result
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false, message: 'Could not transfer cover to bucket.' }
  }
}
