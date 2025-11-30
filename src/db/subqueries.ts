import { eq, or } from 'drizzle-orm'
import { db } from './db'
import {
  episodes,
  ingestionParts,
  ingestionSessions,
  people,
  rawAudios,
} from './schema'

export const ingestionSubquery = db
  .$with('ingestion_subquery')
  .as(
    db
      .select()
      .from(ingestionSessions)
      .leftJoin(
        ingestionParts,
        eq(ingestionParts.sessionId, ingestionSessions.id),
      )
      .leftJoin(rawAudios, eq(rawAudios.partId, ingestionParts.id)),
  )

export const peopleSubquery = db.$with('people_subquery').as(
  db
    .select()
    .from(people)
    .leftJoin(
      episodes,
      or(
        eq(episodes.castPersonId, people.id),
        eq(episodes.bookAuthorId, people.id),
        eq(episodes.scriptAuthorId, people.id),
      ),
    ),
)
