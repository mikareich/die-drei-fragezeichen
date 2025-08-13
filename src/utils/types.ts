import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import type { z } from 'zod'
import type { episodes, people } from '~/db/schema'
import type { RESPONSE_SCHEMA } from './constants'

export type EpisodeView = typeof episodes.$inferSelect

export type PeopleView = typeof people.$inferSelect

export type Speaker = {
  id: number
  name: string
  role: string
  pseudonym: string | null
}

export type Author = {
  id: number
  name: string
}

export type Track = {
  duration: number
  part: string | null
  title: string
  position: number
}

export type Episode = {
  id: number
  number: number
  formattedID: string
  title: string
  description: string
  coverImage: string
  bookAuthors: Map<number, Author>
  scriptAuthors: Map<number, Author>
  cast: Map<number, Speaker>
  releaseDate: Date
  tracks: Map<number, Track>
  totalDuration: number
  parts: Set<string> | null
}

export type Person = {
  id: number
  name: string
  roles: Set<string>
  pseudonyms: Set<string>
  episodesCasted: Map<number, Episode>
  booksAuthored: Map<number, Episode>
  scriptsAuthored: Map<number, Episode>
  contributed: number
}

export type ResponseType = z.infer<typeof RESPONSE_SCHEMA>

export type LambdaResponse = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body: ResponseType
}
