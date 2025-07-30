import type { SQL } from 'drizzle-orm'
import type { EPISODE_SUBQUERY } from '~/db/subqueries'

type UnwrapSQL<T> = T extends SQL<infer U>
  ? U
  : T extends SQL.Aliased<infer U>
    ? U
    : T extends { _: { data: infer D } }
      ? D
      : T extends object
        ? { [K in keyof T]: UnwrapSQL<T[K]> }
        : T

export type SubqueryResult<T> = T extends {
  _: { alias: infer A; selectedFields: infer S }
}
  ? A extends string
    ? { [K in A]: UnwrapSQL<S> }
    : never
  : never

export type RawEpisodeResult = SubqueryResult<
  typeof EPISODE_SUBQUERY
>['episode']

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
