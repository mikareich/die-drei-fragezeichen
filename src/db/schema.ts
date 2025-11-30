import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { v4 as uuid } from 'uuid'

export const metadata = sqliteTable('hörspiel', {
  cover: integer('cover').notNull(),
  description: text('beschreibung'),
  episodeID: integer('hörspielID')
    .primaryKey({ autoIncrement: true })
    .notNull(),
  idAmazon: text('idAmazon'),
  idAmazonMusic: text('idAmazonMusic'),
  idAppleMusic: text('idAppleMusic'),
  idBookbeat: text('idBookbeat'),
  idSpotify: text('idSpotify'),
  idYouTubeMusic: text('idYouTubeMusic'),
  incomplete: integer('unvollständig', { mode: 'boolean' }).notNull(),
  metaDescription: text('metabeschreibung'),
  releaseDate: text('veröffentlichungsdatum'),
  shortDescription: text('kurzbeschreibung'),
  title: text('titel').notNull(),
  urlCoverApple: text('urlCoverApple'),
  urlCoverKosmos: text('urlCoverKosmos'),
  urlDreifragezeichen: text('urlDreifragezeichen'),
})

export const parts = sqliteTable(
  'hörspielTeil',
  {
    episodeID: integer('hörspiel')
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    letter: text('buchstabe'),
    part: integer('teil')
      .primaryKey()
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
  },
  (table) => ({
    uniqueEpisodePosition: unique().on(table.episodeID, table.position),
    uniqueEpisodeLetter: unique().on(table.episodeID, table.letter),
  }),
)

export const series = sqliteTable('serie', {
  episodeID: integer('hörspielID')
    .notNull()
    .unique()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  number: integer('nummer').primaryKey().notNull(),
})

export const specials = sqliteTable('spezial', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  position: integer('position').notNull().unique(),
})

export const shortStories = sqliteTable('kurzgeschichten', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const dieDr3is = sqliteTable('dieDr3i', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  number: integer('nummer'),
})

export const kids = sqliteTable('kids', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  number: integer('nummer'),
})

export const others = sqliteTable('sonstige', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const persons = sqliteTable('person', {
  name: text('name').notNull().unique(),
  personID: integer('personID').primaryKey({ autoIncrement: true }).notNull(),
})

export const pseudonyms = sqliteTable('pseudonym', {
  name: text('name').notNull().unique(),
  pseudonymID: integer('pseudonymID')
    .primaryKey({ autoIncrement: true })
    .notNull(),
})

export const roles = sqliteTable('rolle', {
  name: text('name').notNull().unique(),
  roleID: integer('rolleID').primaryKey().notNull(),
})

export const speakerRoles = sqliteTable(
  'sprechrolle',
  {
    episodeID: integer('hörspielID')
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    roleID: integer('rolleID')
      .notNull()
      .references(() => roles.roleID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    speakerRoleID: integer('sprechrolleID').primaryKey({ autoIncrement: true }),
  },
  (table) => ({
    uniqueEpisodeRole: unique().on(table.episodeID, table.roleID),
    uniqueEpisodePosition: unique().on(table.episodeID, table.position),
  }),
)

export const speakerRoleParts = sqliteTable(
  'sprechrolleTeil',
  {
    episodeID: integer('hörspielID')
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    speakerRoleID: integer('sprechrolleID')
      .notNull()
      .references(() => speakerRoles.speakerRoleID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.speakerRoleID, table.episodeID] }),
    uniqueEpisodePosition: unique().on(table.episodeID, table.position),
  }),
)

export const speaks = sqliteTable(
  'spricht',
  {
    personID: integer('personID')
      .notNull()
      .references(() => persons.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    pseudonymID: integer('pseudonymID').references(
      () => pseudonyms.pseudonymID,
      {
        onDelete: 'set null',
        onUpdate: 'cascade',
      },
    ),
    speakerRoleID: integer('sprechrolleID')
      .notNull()
      .references(() => speakerRoles.speakerRoleID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.speakerRoleID, table.personID] }),
    uniqueSpeakerRolePosition: unique().on(table.speakerRoleID, table.position),
  }),
)

export const bookAuthors = sqliteTable(
  'hörspielBuchautor',
  {
    episodeID: integer('hörspielID')
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    personID: integer('personID')
      .notNull()
      .references(() => persons.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.episodeID, table.personID] }),
  }),
)

export const scriptAuthors = sqliteTable(
  'hörspielSkriptautor',
  {
    episodeID: integer('hörspielID')
      .notNull()
      .references(() => metadata.episodeID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    personID: integer('personID')
      .notNull()
      .references(() => persons.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.episodeID, table.personID] }),
  }),
)

export const mediums = sqliteTable('medium', {
  episodeID: integer('hörspielID')
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  mediumID: integer('mediumID').primaryKey({ autoIncrement: true }).notNull(),
  musicBrainzID: text('musicBrainzID'),
  position: integer('position').notNull(),
  ripLog: integer('ripLog', { mode: 'boolean' }).notNull(),
})

export const tracks = sqliteTable(
  'track',
  {
    duration: integer('dauer').notNull(),
    mediumID: integer('mediumID')
      .notNull()
      .references(() => mediums.mediumID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    title: text('titel').notNull(),
    trackID: integer('trackID').primaryKey({ autoIncrement: true }),
  },
  (table) => ({
    uniqueTrackPosition: unique().on(table.mediumID, table.position),
  }),
)

export const chapters = sqliteTable('kapitel', {
  alternativeTitle: text('abweichenderTitel'),
  episodeID: integer('hörspielID')
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  position: integer('position').notNull(),
  trackID: integer('trackID')
    .primaryKey()
    .notNull()
    .references(() => tracks.trackID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const versions = sqliteTable('version', {
  date: text('date').notNull().default('CURRENT_TIMESTAMP'),
  major: integer('major').notNull(),
  minor: integer('minor').notNull(),
  patch: integer('patch').notNull(),
})

export const episodes = sqliteTable(
  'episode_view',
  {
    description: text(),
    episodeId: integer().notNull(),
    number: integer(),
    releaseDate: text(),
    title: text().notNull(),

    trackDuration: integer(),
    trackPosition: integer(),
    trackTitle: text(),
    trackPart: integer(),

    castPersonId: integer(),
    castName: text(),
    castPseudonym: text(),
    castRole: text(),

    bookAuthorId: integer(),
    bookAuthorName: text(),

    scriptAuthorId: integer(),
    scriptAuthorName: text(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.episodeId,
        table.trackPosition,
        table.trackPart,
        table.castPersonId,
        table.bookAuthorId,
        table.scriptAuthorId,
      ],
    }),
  ],
)

export const people = sqliteTable(
  'people_view',
  {
    id: integer().notNull(),
    name: text().notNull(),
    roles: text(),
    pseudonyms: text(),
    contributed: integer().notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.id] })],
)

export const ingestionSessions = sqliteTable('ingestionSessions', {
  id: text().primaryKey(),
  episodeNumber: integer().notNull(),
  episodeData: text().notNull(),
  status: text('status', {
    enum: ['created', 'completed', 'failed'],
  })
    .default('created')
    .notNull(),
})

export const ingestionParts = sqliteTable('ingestionParts', {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuid()),
  sessionId: text()
    .references(() => ingestionSessions.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  status: text('status', {
    enum: ['pending', 'uploading', 'deleting', 'processing', 'ready', 'failed'],
  })
    .default('pending')
    .notNull(),
  index: integer().notNull(),
})

export const rawAudios = sqliteTable('rawAudios', {
  id: text().primaryKey(),
  partId: text()
    .references(() => ingestionParts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  s3Key: text().notNull(),
  uploadUrl: text().notNull(),
  fileName: text(),
})
