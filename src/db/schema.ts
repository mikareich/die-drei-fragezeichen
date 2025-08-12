import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

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

export const part = sqliteTable(
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

export const special = sqliteTable('spezial', {
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

export const dieDr3i = sqliteTable('dieDr3i', {
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

export const other = sqliteTable('sonstige', {
  episodeID: integer('hörspielID')
    .primaryKey()
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const person = sqliteTable('person', {
  name: text('name').notNull().unique(),
  personID: integer('personID').primaryKey({ autoIncrement: true }).notNull(),
})

export const pseudonym = sqliteTable('pseudonym', {
  name: text('name').notNull().unique(),
  pseudonymID: integer('pseudonymID')
    .primaryKey({ autoIncrement: true })
    .notNull(),
})

export const role = sqliteTable('rolle', {
  name: text('name').notNull().unique(),
  roleID: integer('rolleID').primaryKey().notNull(),
})

export const speakerRole = sqliteTable(
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
      .references(() => role.roleID, {
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

export const speakerRolePart = sqliteTable(
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
      .references(() => speakerRole.speakerRoleID, {
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
      .references(() => person.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    pseudonymID: integer('pseudonymID').references(
      () => pseudonym.pseudonymID,
      {
        onDelete: 'set null',
        onUpdate: 'cascade',
      },
    ),
    speakerRoleID: integer('sprechrolleID')
      .notNull()
      .references(() => speakerRole.speakerRoleID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.speakerRoleID, table.personID] }),
    uniqueSpeakerRolePosition: unique().on(table.speakerRoleID, table.position),
  }),
)

export const bookAuthor = sqliteTable(
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
      .references(() => person.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.episodeID, table.personID] }),
  }),
)

export const scriptAuthor = sqliteTable(
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
      .references(() => person.personID, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.episodeID, table.personID] }),
  }),
)

export const medium = sqliteTable('medium', {
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

export const track = sqliteTable(
  'track',
  {
    duration: integer('dauer').notNull(),
    mediumID: integer('mediumID')
      .notNull()
      .references(() => medium.mediumID, {
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

export const chapter = sqliteTable('kapitel', {
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
    .references(() => track.trackID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const version = sqliteTable('version', {
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
