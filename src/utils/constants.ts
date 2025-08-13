import { z } from 'zod'

export const ITEM_LIMIT = 10

export const QUERY_DEBOUNCE = 200

export const LOC_NA_CONTENT = 'Keine Angaben.'

export const RESPONSE_SCHEMA = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.record(z.any()).optional(),
})
