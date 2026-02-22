import { StartExecutionCommand } from '@aws-sdk/client-sfn'
import type { APIGatewayProxyEventV2, S3Event } from 'aws-lambda'
import { asc, eq } from 'drizzle-orm'
import { Resource } from 'sst'
import { z } from 'zod'
import { getEpisodeByNumber } from '~/actions/episode'
import { removeIngestionPart } from '~/actions/ingestion'
import { db } from '~/db/db'
import {
  ingestionParts,
  ingestionSessions,
  processedAudioFiles,
} from '~/db/schema'
import { sfn } from '~/utils/aws'
import type { LambdaResponse } from '~/utils/types'
import type { prepareAudio_REQUEST_SCHEMA } from './audio'

export const INGESTION_REQUEST_BODY = z.object({
  episodeNumber: z.number().min(1).max(234),
  sessionId: z.string().uuid(),
})

export type IngestionResponseBody = {
  sessionId: string
}

/** Fetches episode data and populates ingestion session table */
export async function createIngestionSession(
  event: APIGatewayProxyEventV2,
): Promise<LambdaResponse<IngestionResponseBody>> {
  try {
    const { episodeNumber, sessionId } = INGESTION_REQUEST_BODY.parse(
      event.body,
    )

    const episodeData = await getEpisodeByNumber(episodeNumber)
    if (!episodeData) throw new Error('Could not fetch episode data')

    await db
      .insert(ingestionSessions)
      .values({
        id: sessionId,
        episodeNumber,
        episodeData: JSON.stringify(episodeData),
      })
      .returning()

    return {
      statusCode: 200,
      body: {
        success: true,
        data: { sessionId },
      },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: { success: false },
    }
  }
}

/** Updates part status and file name. Triggered by s3 entry. */
export async function triggerIngestionPipeline(event: S3Event) {
  for (const record of event.Records) {
    const { key } = record.s3.object

    // mark part as uploaded
    const match = key.match(/^raw-audio\/([^/]+)\/([^/]+)\./)
    if (!match) {
      console.warn('Unexpected key format:', key)
      continue
    }

    const fileId = match[2]
    const partId = await db
      .select()
      .from(processedAudioFiles)
      .where(eq(processedAudioFiles.id, fileId))
      .then((data) => data.at(0)?.partId || null)

    if (!partId) {
      console.error('Could not find associated part.')
      continue
    }

    await db
      .update(ingestionParts)
      .set({ status: 'processing' })
      .where(eq(ingestionParts.id, partId))

    // trigger ingestion pipeline
    const executionCommand = new StartExecutionCommand({
      stateMachineArn: Resource.IngestionFlow.arn,
      input: JSON.stringify({ partId } satisfies z.infer<
        typeof prepareAudio_REQUEST_SCHEMA
      >),
    })

    await sfn.send(executionCommand)
  }
}

export const removeIngestionSession_REQUEST_SCHEMA = z.object({
  sessionId: z.string().uuid(),
})

/** Remove db entries and all associated files */
export async function removeIngestionSession(
  event: APIGatewayProxyEventV2,
): Promise<LambdaResponse<undefined>> {
  try {
    const { sessionId } = removeIngestionSession_REQUEST_SCHEMA.parse(
      event.body,
    )

    await db.transaction(async (tx) => {
      const parts = await tx
        .select({ id: ingestionParts.id })
        .from(ingestionParts)
        .where(eq(ingestionParts.sessionId, sessionId))
        .orderBy(asc(ingestionParts.index))

      for await (const { id } of parts) {
        const result = await removeIngestionPart({
          partId: id,
          transaction: tx,
        })
        if (!result.success) throw new Error('Could not remove ingestion part.')
      }

      // delete session entry
      await tx
        .delete(ingestionSessions)
        .where(eq(ingestionSessions.id, sessionId))
    })

    return {
      statusCode: 200,
      body: { success: true, data: undefined },
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: {
        success: false,
      },
    }
  }
}
