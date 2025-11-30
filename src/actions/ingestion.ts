'use server'

import { InvokeCommand } from '@aws-sdk/client-lambda'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { ResultSet } from '@libsql/client'
import { desc, type ExtractTablesWithRelations, eq, gt } from 'drizzle-orm'
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core'
import { Resource } from 'sst'
import type { z } from 'zod'
import type { UploadUrlResponse } from '~/../functions/audio'
import type { removeIngestionSession_REQUEST_SCHEMA } from '~/../functions/orchestrator'
import { db } from '~/db/db'
import { ingestionParts, ingestionSessions, rawAudios } from '~/db/schema'
import { ingestionSubquery } from '~/db/subqueries'
import { lambda, parseLambdaResponse, s3 } from '~/utils/aws'
import { parseIngestionSessions } from '~/utils/parseIngestion'
import type { GenericResponse, IngestionSession } from '~/utils/types'

/** Entirely removes ignestion db entries and respective files */
export async function removeIngestionPart({
  partId,
  transaction,
}: {
  partId: string
  transaction?: SQLiteTransaction<
    'async',
    ResultSet,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >
}): Promise<GenericResponse<undefined>> {
  try {
    if (!transaction) {
      return db.transaction((transaction) =>
        removeIngestionPart({ partId, transaction }),
      )
    }

    const part = await transaction
      .select()
      .from(ingestionParts)
      .innerJoin(rawAudios, eq(rawAudios.partId, partId))
      .then((data) => {
        if (!data[0]?.ingestionParts || !data[0]?.rawAudios) return null

        return {
          ...data[0].ingestionParts,
          file: data[0].rawAudios,
        }
      })

    if (!part) throw new Error('Could not find requested part.')

    // delete requested part and move up all following parts
    // entry in `rawAudios` gets deleted automatically due to sql's cascading behaviour
    await transaction
      .delete(ingestionParts)
      .where(eq(ingestionParts.id, partId))

    const followingPartIds = await transaction
      .select({ id: ingestionParts.id, index: ingestionParts.index })
      .from(ingestionParts)
      .where(gt(ingestionParts.index, part.index))

    for await (const { id, index } of followingPartIds) {
      await transaction
        .update(ingestionParts)
        .set({ index: index - 1 })
        .where(eq(ingestionParts.id, id))
    }

    // delete raw audio file from s3
    // TODO: remove associated processed files, transcripts and vectors

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: Resource['DDF-Bucket'].name,
      Key: part.file.s3Key,
    })

    await s3.send(deleteObjectCommand)

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
    }
  }
}

/** Computes next part and generates respective upload url */
export async function addNextPart({ sessionId }: { sessionId: string }) {
  try {
    const part = await db
      .select()
      .from(ingestionParts)
      .where(eq(ingestionParts.sessionId, sessionId))
      .orderBy(desc(ingestionParts.index))
      .then((data) => Math.max(data[0]?.index || 0, 0) + 1)

    const payload = { body: { part, sessionId } }

    const invokeCommand = new InvokeCommand({
      FunctionName: Resource.GenerateUploadUrl.name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload)),
    })

    const response = await lambda.send(invokeCommand)

    const result = parseLambdaResponse<UploadUrlResponse>(response.Payload)
    if (!result) throw new Error('Could not parse lambda response')

    return { success: true, data: undefined }
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false, message: 'Could generate upload url.' }
  }
}

export async function getIngestionSession({
  sessionId,
}: {
  sessionId: string
}): Promise<GenericResponse<IngestionSession>> {
  console.log('fetching session', sessionId)
  try {
    const [session] = await db
      .select()
      .from(ingestionSessions)
      .leftJoin(
        ingestionParts,
        eq(ingestionParts.sessionId, ingestionSessions.id),
      )
      .leftJoin(rawAudios, eq(rawAudios.partId, ingestionParts.id))
      .where(eq(ingestionSessions.id, sessionId))
      .then(parseIngestionSessions)

    if (!session) throw new Error('Could not find specified ingestion session.')

    return { success: true, data: session }
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false }
  }
}

/** Creates ingestion session if necessary and returns it */
export async function linkIngestionSession({
  episodeNumber,
  sessionId,
}: {
  episodeNumber: number
  sessionId: string
}): Promise<GenericResponse<IngestionSession>> {
  try {
    const payload = { body: { episodeNumber, sessionId } }

    const invokeCommand = new InvokeCommand({
      FunctionName: Resource.CreateIngestionSession.name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload)),
    })

    const response = await lambda.send(invokeCommand)

    const result = parseLambdaResponse(response.Payload)
    if (!result) throw new Error('Could not parse lambda response')

    // check if session already exists
    const sessionExists = await db
      .select()
      .from(ingestionSessions)
      .where(eq(ingestionSessions.id, sessionId))
      .then((data) => data.length > 0)

    // invoke lambda to create session
    if (!sessionExists) {
      const payload = { body: { episodeNumber, sessionId } }

      const invokeCommand = new InvokeCommand({
        FunctionName: Resource.CreateIngestionSession.name,
        InvocationType: 'RequestResponse',
        Payload: Buffer.from(JSON.stringify(payload)),
      })

      const response = await lambda.send(invokeCommand)

      const result = parseLambdaResponse(response.Payload)
      if (!result) throw new Error('Could not parse lambda response')
    }

    return getIngestionSession({ sessionId })
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false }
  }
}

/** Remove db entries and all associated files */
export async function removeIngestionSession({
  sessionId,
}: z.infer<typeof removeIngestionSession_REQUEST_SCHEMA>): Promise<
  GenericResponse<undefined>
> {
  try {
    const payload = { body: { sessionId } }

    const invokeCommmand = new InvokeCommand({
      FunctionName: Resource.RemoveIngestionSession.name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload)),
    })

    const response = await lambda.send(invokeCommmand)

    const result = parseLambdaResponse(response.Payload)
    if (!result?.success) throw new Error('Could not parse lambda response.')

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false }
  }
}

/** Updates file properties in db */
export async function markFileAsUpdating({
  fileName,
  fileId,
}: {
  fileName: string
  fileId: string
}): Promise<GenericResponse<undefined>> {
  try {
    await db.transaction(async (tx) => {
      const partId = await tx
        .select({ id: rawAudios.partId })
        .from(rawAudios)
        .where(eq(rawAudios.id, fileId))
        .then((data) => data.at(0)?.id || null)
      if (!partId) throw new Error('Could not find associated part')

      await tx
        .update(rawAudios)
        .set({ fileName })
        .where(eq(rawAudios.id, fileId))
      await tx
        .update(ingestionParts)
        .set({ status: 'uploading' })
        .where(eq(ingestionParts.id, partId))
    })

    return { success: true, data: undefined }
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false }
  }
}
