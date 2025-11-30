import { ClientInputEndpointParameters } from '@aws-sdk/client-lambda'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { and, eq } from 'drizzle-orm'
import { Resource } from 'sst'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { db } from '~/db/db'
import { ingestionParts, ingestionSessions, rawAudios } from '~/db/schema'
import { ingestionSubquery } from '~/db/subqueries'
import { s3 } from '~/utils/aws'
import { parseIngestionSessions } from '~/utils/parseIngestion'
import type { IngestionPart, LambdaResponse, RawFile } from '~/utils/types'

export const UPLOAD_URL_REQUEST_BODY = z.object({
  sessionId: z.string().uuid(),
  part: z.number(),
})

export type UploadUrlResponse = {
  file: RawFile
  part: IngestionPart
}

/** Generates and returns a pre-signed url to upload the audio files to. */
export async function generateUploadUrl(
  event: APIGatewayProxyEventV2,
): Promise<LambdaResponse<UploadUrlResponse>> {
  try {
    const { part: index, sessionId } = UPLOAD_URL_REQUEST_BODY.parse(event.body)

    const [part] = await db
      .insert(ingestionParts)
      .values({ sessionId, index })
      .returning()

    const fileId = uuid()
    const s3Key = `raw-audio/${sessionId}/${fileId}.mp3`

    const putCommand = new PutObjectCommand({
      Bucket: Resource['DDF-Bucket'].name,
      Key: s3Key,
      ContentType: 'audio/mpeg',
    })

    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 60 * 5 })

    const [file] = await db
      .insert(rawAudios)
      .values({ id: fileId, partId: part.id, s3Key, uploadUrl })
      .returning()

    return {
      statusCode: 200,
      body: {
        success: true,
        data: { file, part },
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

export const prepareAudio_REQUEST_SCHEMA = z.object({
  partId: z.string().uuid(),
})

export async function prepareAudio(
  input: any,
): Promise<LambdaResponse<undefined>> {
  try {
    const { partId } = prepareAudio_REQUEST_SCHEMA.parse(input.env)

    const [session] = await db
      .select()
      .from(ingestionSessions)
      .leftJoin(
        ingestionParts,
        and(
          eq(ingestionParts.id, partId),
          eq(ingestionParts.sessionId, ingestionSessions.id),
        ),
      )
      .leftJoin(rawAudios, eq(rawAudios.partId, ingestionParts.id))
      .then(parseIngestionSessions)

    if (!session)
      throw new Error('Could not find associated ingestion session 😭')

    const part = session.parts.find(
      (part) => part.id === partId,
    ) as IngestionPart

    return {
      statusCode: 200,
      body: { success: true, data: undefined },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: { success: false },
    }
  }
}
