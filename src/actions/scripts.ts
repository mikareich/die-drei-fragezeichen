'use server'

import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { s3 } from '~/utils/s3'

const BUCKET_NAME = 'die-drei-fragezeichen-scripts'

export type Script = { content: string; role: string }[]

/** returns part from s3 bucket including until the specified part */
export async function getScriptUntilPart(
  id: number,
  maxPage: number,
): Promise<Script | null> {
  'use cache'

  return null

  // const bucketPath = `json/${id}/`

  // try {
  //   // first off: read bucket contents
  //   const listCommand = new ListObjectsV2Command({
  //     Bucket: BUCKET_NAME,
  //     Prefix: bucketPath,
  //   })
  //   const { Contents: listedContents } = await s3.send(listCommand)
  //   if (!listedContents) throw new Error('Could not read contents of bucket.')

  //   const paths = listedContents
  //     .map((file) => {
  //       const path = file?.Key
  //       if (!path) throw new Error('Could not read path of bucket contents')

  //       const part = Number(path.replaceAll(/(json\/\d*\/)|(\.json)/g, ''))
  //       return [part, path] as const
  //     })
  //     .filter(([part]) => part <= maxPage)
  //     .toSorted(([partA], [partB]) => {
  //       return partA - partB
  //     })
  //     .map(([_, path]) => path)

  //   const script: Script = []
  //   for await (const path of paths) {
  //     const readCommand = new GetObjectCommand({
  //       Bucket: BUCKET_NAME,
  //       Key: path,
  //     })
  //     const { Body } = await s3.send(readCommand)

  //     const content = await Body?.transformToString('utf-8')
  //     if (!content) throw new Error('Could not read the part content.')

  //     const part: Script = JSON.parse(content)?.script
  //     if (part.length === 0) throw new Error('Malformed script from s3 bucket.')

  //     script.push(...part)
  //   }

  //   return script
  // } catch (e) {
  //   console.error(e)

  //   return null
  // }
}
