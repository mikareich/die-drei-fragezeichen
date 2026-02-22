import { tmpdir } from 'node:os'
import path from 'node:path/win32'
import { ClientInputEndpointParameters } from '@aws-sdk/client-lambda'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { and, eq } from 'drizzle-orm'
import ffmpeg from 'ffmpeg-static'
import { Resource } from 'sst'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { db } from '~/db/db'
import {
  ingestionParts,
  ingestionSessions,
  processedAudioFiles,
} from '~/db/schema'
import { ingestionSubquery } from '~/db/subqueries'
import { s3 } from '~/utils/aws'
import { parseIngestionSessions } from '~/utils/parseIngestion'
import type {
  IngestionPart,
  IngestionSession,
  LambdaResponse,
  RawFile,
} from '~/utils/types'

export const UPLOAD_URL_REQUEST_BODY = z.object({
  sessionId: z.string().uuid(),
  part: z.number(),
})

export type UploadUrlResponse = {
  uploadUrl: string
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
    const s3Key = `raw-audio/${sessionId}/${part.id}/${fileId}.mp3`

    const putCommand = new PutObjectCommand({
      Bucket: Resource['DDF-Bucket'].name,
      Key: s3Key,
      ContentType: 'audio/mpeg',
    })

    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 60 * 5 })

    return {
      statusCode: 200,
      body: {
        success: true,
        data: { uploadUrl, part },
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
      .leftJoin(
        processedAudioFiles,
        eq(processedAudioFiles.partId, ingestionParts.id),
      )
      .then(parseIngestionSessions)

    if (!session)
      throw new Error('Could not find associated ingestion session 😭')

    const part = session.parts.find(
      (part) => part.id === partId,
    ) as IngestionSession['parts'][number]

    if (!part.rawAudioFileS3Key) throw new Error('No file attached to part ⁉️')

    const getCommand = new GetObjectCommand({
      Bucket: Resource['DDF-Bucket'].name,
      Key: part.rawAudioFileS3Key,
    })
    const rawAudioUrl = await getSignedUrl(s3, getCommand)

    const s3OutputPath = `processed/${session.id}/${part.id}`
    const localOutputPattern = path.join(tmpdir(), 'chunk-%03d.mp3')

    // await new Promise<void>((resolve, reject) => {
    //   ffmpeg(signedInputUrl)
    //     .inputOptions([
    //       '-reconnect 1',
    //       '-reconnect_streamed 1',
    //       '-reconnect_delay_max 5',
    //     ])
    //     // "Single-pass" loudness normalization (EBU R128)
    //     .audioFilters('loudnorm=I=-16:TP=-1.5:LRA=11')
    //     .outputOptions([
    //       '-f segment', // Split into segments
    //       '-segment_time 300', // 5 minutes (300 seconds) per chunk
    //       '-c:a libmp3lame', // Re-encode to mp3
    //       '-b:a 128k', // 128k bitrate
    //       '-reset_timestamps 1', // Reset timestamps for each chunk
    //     ])
    //     .output(localOutputPattern)
    //     .on('start', (cmd) => console.log('FFmpeg started:', cmd))
    //     .on('end', () => resolve())
    //     .on('error', (err) => reject(err))
    //     .run()
    // })

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
