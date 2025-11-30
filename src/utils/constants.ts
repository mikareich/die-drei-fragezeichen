import { z } from 'zod'

export const ITEM_LIMIT = 10

export const QUERY_DEBOUNCE = 200

export const LOC_NA_CONTENT = 'Keine Angaben.'

export const GENERIC_RESPONSE_SCHEMA = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.record(z.any()).optional(),
})

export const MAX_UPLOAD_SIZE = 104857600 // 100 MB
