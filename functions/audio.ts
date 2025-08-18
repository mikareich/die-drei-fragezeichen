import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { Resource } from 'sst'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { s3 } from '~/utils/aws'
import type { LambdaResponse } from '~/utils/types'

export const getUploadURLForAudio_REQUEST_SCHEMA = z.object({
  episodeNumber: z.number(),
  part: z.number(),
})

/** Generates and returns a pre-signed url to upload the audio files to. */
export async function getUploadURLForAudio(
  event: APIGatewayProxyEventV2,
): Promise<LambdaResponse> {
  try {
    const { episodeNumber, part } = getUploadURLForAudio_REQUEST_SCHEMA.parse(
      event.body,
    )

    if (Number.isNaN(episodeNumber) || Number.isNaN(part)) {
      throw new Error('Request body is malformed')
    }

    const id = uuid()
    const key = `landingzone/${episodeNumber}/${part}/${id}.mp3`

    const putCommand = new PutObjectCommand({
      Bucket: Resource['DDF-Bucket'].name,
      Key: key,
      ContentType: 'audio/mpeg',
    })

    const url = await getSignedUrl(s3, putCommand, { expiresIn: 60 * 5 })

    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'Upload url successfully generated',
        data: {
          url,
          id,
        },
      },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: {
        success: false,
        message: `Could not generate an upload url.`,
      },
    }
  }
}
