import { LambdaClient } from '@aws-sdk/client-lambda'
import { S3Client } from '@aws-sdk/client-s3'
import { RESPONSE_SCHEMA } from './constants'

export const s3 = new S3Client({})

export const lambda = new LambdaClient({})

export function parseLambdaResponse(payload: Uint8Array | string | undefined) {
  if (!payload || typeof payload === 'string') return null

  const stringifiedResponse = Buffer.from(payload).toString()
  const jsonResponse = JSON.parse(stringifiedResponse)

  const { success, data } = RESPONSE_SCHEMA.safeParse(jsonResponse?.body)
  if (!success) return null

  return data
}
