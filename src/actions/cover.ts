'use server'

import { InvokeCommand } from '@aws-sdk/client-lambda'
import { Resource } from 'sst'
import type { z } from 'zod'
import { lambda, parseLambdaResponse } from '~/utils/aws'
import type { GenericResponse } from '~/utils/types'
import type { transferCoverToBucket_REQUEST_SCHEMA } from '../../functions/cover'

export async function transferCoverToBucket(
  episodeNumber: number,
): Promise<GenericResponse<undefined>> {
  try {
    const payload = {
      body: { episodeNumber } as z.infer<
        typeof transferCoverToBucket_REQUEST_SCHEMA
      >,
    }

    const invokeCommand = new InvokeCommand({
      FunctionName: Resource.TransferCoverFn.name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload)),
    })

    const response = await lambda.send(invokeCommand)

    const result = parseLambdaResponse(response.Payload)
    if (!result) throw new Error('Could not parse lambda response')

    return { success: true, data: undefined }
  } catch (error) {
    if (Resource.App.stage !== 'production') console.error(error)
    return { success: false, message: 'Could not transfer cover to bucket.' }
  }
}
