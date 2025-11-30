import { LambdaClient } from '@aws-sdk/client-lambda'
import { S3Client } from '@aws-sdk/client-s3'
import { SFNClient } from '@aws-sdk/client-sfn'
import { GENERIC_RESPONSE_SCHEMA } from './constants'
import type { GenericResponse } from './types'

export const s3 = new S3Client({})

export const lambda = new LambdaClient({})

export const sfn = new SFNClient({})

export function parseLambdaResponse<
  GenericResponseData extends Record<string, unknown> | undefined,
>(payload: Uint8Array | string | undefined) {
  if (!payload || typeof payload === 'string') return null

  const stringifiedResponse = Buffer.from(payload).toString()
  const jsonResponse = JSON.parse(stringifiedResponse)

  const { success, data } = GENERIC_RESPONSE_SCHEMA.safeParse(
    jsonResponse?.body,
  )
  if (!success) return null

  return data as GenericResponse<GenericResponseData>
}
