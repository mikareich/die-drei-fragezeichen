import { PutObjectCommand } from '@aws-sdk/client-s3'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { Resource } from 'sst'
import { z } from 'zod'
import { s3 } from '~/utils/aws'
import type { LambdaResponse } from '~/utils/types'

export const transferCoverToBucket_REQUEST_SCHEMA = z.object({
  episodeNumber: z.number(),
})

export async function transferCoverToBucket(
  event: APIGatewayProxyEventV2,
): Promise<LambdaResponse> {
  try {
    const { episodeNumber } = transferCoverToBucket_REQUEST_SCHEMA.parse(
      event.body,
    )

    if (Number.isNaN(episodeNumber)) {
      throw new Error('Episode number not a number.')
    }

    const formattedNumber = String(episodeNumber).padStart(3, '0')

    // fetch cover from dreimetadaten.de
    const url = `https://dreimetadaten.de/data/Serie/${formattedNumber}/cover.png`
    const dreimetadatenResponse = await fetch(url)

    if (!dreimetadatenResponse.ok) {
      throw new Error('Could not fetch cover from ')
    }

    const coverArrayBuffer = await dreimetadatenResponse.arrayBuffer()
    const coverBuffer = Buffer.from(coverArrayBuffer)

    // store cover in bucket
    const putCommand = new PutObjectCommand({
      Key: `covers/${episodeNumber}.png`,
      Bucket: Resource['DDF-Bucket'].name,
      ContentType: 'image/png',
      Body: coverBuffer,
    })

    await s3.send(putCommand)

    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'Cover transferred successfully',
      },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: {
        success: false,
        message: 'Error transfering cover.',
      },
    }
  }
}
