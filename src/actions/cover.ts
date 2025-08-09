'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Resource } from 'sst'
import { s3 } from '~/utils/s3'

/** Copies episode cover hosted on https://dreimetadaten.de/data/Serie/xxx/cover.png and moves it to the dedicated cover bucket */
export async function transferCoverToBucket(episodeID: number) {
  try {
    if (Resource.App.stage === 'production') {
      throw new Error('Can only transfer in development')
    }

    const formattedID = String(episodeID).padStart(3, '0')

    // fetch cover from dreimetadaten.de
    const dreimetadatenResponse = await fetch(
      `https://dreimetadaten.de/data/Serie/${formattedID}/cover.png`,
    )
    const cover = await dreimetadatenResponse.blob()
    if (cover.type !== 'image/png') throw new Error('Cover not png')

    // store cover in bucket
    const command = new PutObjectCommand({
      Key: `covers/${episodeID}.png`,
      Bucket: Resource['DDF-Bucket'].name,
      ContentType: cover.type,
    })
    const url = await getSignedUrl(s3, command)

    const s3Response = await fetch(url, { method: 'PUT', body: cover })
    if (!s3Response.ok) throw new Error('Could not upload cover to s3')

    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return null
  }
}
