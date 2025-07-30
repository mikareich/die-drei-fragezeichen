import { and, eq, exists, or, sql } from 'drizzle-orm'
import { db } from './db'
import { schema } from './schema'

export const SCRIPT_AUTHOR_SUBQUERY = db
  .select({
    episodeID: sql<number>`${schema.metadata.episodeID}`.as(
      'scriptAuthorEpisodeID',
    ),
    id: sql<number>`${schema.person.personID}`.as('scriptAuthorID'),
    name: sql<string>`${schema.person.name}`.as('scriptAuthorName'),
  })
  .from(schema.metadata)
  .leftJoin(
    schema.scriptAuthor,
    eq(schema.scriptAuthor.episodeID, schema.metadata.episodeID),
  )
  .innerJoin(
    schema.person,
    eq(schema.person.personID, schema.scriptAuthor.personID),
  )
  .as('scriptAuthor')

export const METADATA_SUBQUERY = db
  .select({
    description: sql<string>`${schema.metadata.description}`.as(
      'metadataDescription',
    ),
    id: sql<number>`${schema.metadata.episodeID}`.as('metadataID'),
    number: sql<number>`${schema.series.number}`.as('metadataNumber'),
    releaseDate: sql<string>`${schema.metadata.releaseDate}`.as(
      'metadataReleaseDate',
    ),
    title: sql<string>`${schema.metadata.title}`.as('metadataTitle'),
  })
  .from(schema.metadata)
  .where(
    and(
      eq(schema.metadata.incomplete, sql`0`),
      or(
        exists(
          db
            .select({ dummy: sql`1` })
            .from(schema.series)
            .where(eq(schema.series.episodeID, schema.metadata.episodeID)),
        ),
        exists(
          db
            .select({ dummy: sql`1` })
            .from(schema.part)
            .where(eq(schema.part.part, schema.metadata.episodeID)),
        ),
      ),
    ),
  )
  .leftJoin(
    schema.series,
    eq(schema.metadata.episodeID, schema.series.episodeID),
  )
  .leftJoin(
    schema.medium,
    eq(schema.medium.episodeID, schema.metadata.episodeID),
  )
  .leftJoin(
    schema.part,
    and(
      eq(schema.part.episodeID, schema.metadata.episodeID),
      eq(schema.part.position, schema.medium.position),
    ),
  )
  .as('metadata')

export const TRACK_SUBQUERY = db
  .select({
    duration: sql<number>`${schema.track.duration}`.as('trackDuration'),
    episodeID: sql<number>`${schema.metadata.episodeID}`.as('trackEpisodeID'),
    position: sql<number>`${schema.track.position}`.as('trackPosition'),
    title: sql<string>`${schema.track.title}`.as('trackTitle'),
    part: sql<number>`${schema.medium.position}`.as('trackPart'),
  })
  .from(schema.metadata)
  .leftJoin(
    schema.medium,
    eq(schema.medium.episodeID, schema.metadata.episodeID),
  )
  .innerJoin(schema.track, eq(schema.track.mediumID, schema.medium.mediumID))
  .as('track')

export const CAST_SUBQUERY = db
  .select({
    episodeID: sql<number>`${schema.metadata.episodeID}`.as('castEpisodeID'),
    id: sql<number>`${schema.person.personID}`.as('castPersonID'),
    name: sql<string>`${schema.person.name}`.as('castName'),
    pseudonym: sql<string>`${schema.pseudonym.name}`.as('castPseudonym'),
    role: sql<string>`${schema.role.name}`.as('castRole'),
  })
  .from(schema.metadata)
  .leftJoin(
    schema.speakerRole,
    eq(schema.speakerRole.episodeID, schema.metadata.episodeID),
  )
  .leftJoin(
    schema.speaks,
    eq(schema.speaks.speakerRoleID, schema.speakerRole.speakerRoleID),
  )
  .innerJoin(schema.role, eq(schema.role.roleID, schema.speakerRole.roleID))
  .innerJoin(schema.person, eq(schema.person.personID, schema.speaks.personID))
  .leftJoin(
    schema.pseudonym,
    eq(schema.pseudonym.pseudonymID, schema.speaks.pseudonymID),
  )
  .as('cast')

export const BOOK_AUTHOR_SUBQUERY = db
  .select({
    episodeID: sql<number>`${schema.metadata.episodeID}`.as(
      'bookAuthorEpisodeID',
    ),
    id: sql<number>`${schema.person.personID}`.as('bookAuthorId'),
    name: sql<string>`${schema.person.name}`.as('bookAuthorName'),
  })
  .from(schema.metadata)
  .leftJoin(
    schema.bookAuthor,
    eq(schema.bookAuthor.episodeID, schema.metadata.episodeID),
  )
  .innerJoin(
    schema.person,
    eq(schema.person.personID, schema.bookAuthor.personID),
  )
  .as('bookAuthor')

export const PART_SUBQUERY = db
  .select({
    episodeID: sql<number>`${schema.part.part}`.as('partEpisodeID'),
    letter: sql<string>`${schema.part.letter}`.as('partLetter'),
    parentID: sql<number>`${schema.part.episodeID}`.as('partParentID'),
  })
  .from(schema.metadata)
  .leftJoin(schema.part, eq(schema.metadata.episodeID, schema.part.part))
  .as('part')

export const EPISODE_SUBQUERY = db
  .select()
  .from(METADATA_SUBQUERY)
  .leftJoin(TRACK_SUBQUERY, eq(TRACK_SUBQUERY.episodeID, METADATA_SUBQUERY.id))
  .leftJoin(CAST_SUBQUERY, eq(CAST_SUBQUERY.episodeID, METADATA_SUBQUERY.id))
  .leftJoin(PART_SUBQUERY, eq(PART_SUBQUERY.episodeID, METADATA_SUBQUERY.id))
  .leftJoin(
    BOOK_AUTHOR_SUBQUERY,
    eq(BOOK_AUTHOR_SUBQUERY.episodeID, METADATA_SUBQUERY.id),
  )
  .leftJoin(
    SCRIPT_AUTHOR_SUBQUERY,
    eq(SCRIPT_AUTHOR_SUBQUERY.episodeID, METADATA_SUBQUERY.id),
  )
  .as('episode')

export const PEOPLE_SUBQUERY = db
  .select({
    id: CAST_SUBQUERY.id,
    name: CAST_SUBQUERY.name,
  })
  .from(CAST_SUBQUERY)
  .innerJoin(
    schema.series,
    eq(schema.series.episodeID, CAST_SUBQUERY.episodeID),
  )
  .union(
    db
      .select({
        id: BOOK_AUTHOR_SUBQUERY.id,
        name: BOOK_AUTHOR_SUBQUERY.name,
      })
      .from(BOOK_AUTHOR_SUBQUERY)
      .innerJoin(
        schema.series,
        eq(schema.series.episodeID, BOOK_AUTHOR_SUBQUERY.episodeID),
      ),
  )
  .union(
    db
      .select({
        id: SCRIPT_AUTHOR_SUBQUERY.id,
        name: SCRIPT_AUTHOR_SUBQUERY.name,
      })
      .from(SCRIPT_AUTHOR_SUBQUERY)
      .innerJoin(
        schema.series,
        eq(schema.series.episodeID, SCRIPT_AUTHOR_SUBQUERY.episodeID),
      ),
  )
  .as('people')
