import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  (table) => [primaryKey({ columns: [table.episodeID, table.part] })],
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

export const speakerRole = sqliteTable('sprechrolle', {
  episodeID: integer('hörspielID')
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  position: integer('position').notNull().unique(),
  roleID: integer('rolleID')
    .notNull()
    .unique()
    .references(() => role.roleID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  speakerRoleID: integer('sprechrolleID').primaryKey({ autoIncrement: true }),
})

export const speakerRolePart = sqliteTable('sprechrolleTeil', {
  episodeID: integer('hörspielID')
    .notNull()
    .references(() => metadata.episodeID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  position: integer('position').notNull(),
  speakerRoleID: integer('sprechrolleID')
    .notNull()
    .references(() => role.roleID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const speaks = sqliteTable('spricht', {
  personID: integer('personID')
    .notNull()
    .references(() => person.personID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  position: integer('position').notNull(),
  pseudonymID: integer('pseudonymID'),
  speakerRoleID: integer('sprechrolleID')
    .notNull()
    .references(() => role.roleID, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const bookAuthor = sqliteTable('hörspielBuchautor', {
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
})

export const scriptAuthor = sqliteTable('hörspielSkriptautor', {
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
})

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

export const track = sqliteTable('track', {
  duration: integer('dauer').notNull(),
  mediumID: integer('mediumID').notNull().unique(),
  position: integer('position').notNull().unique(),
  title: text('titel').notNull(),
  trackID: integer('trackID').primaryKey(),
})

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

export const schema = {
  bookAuthor,
  chapter,
  medium,
  metadata,
  part,
  person,
  pseudonym,
  role,
  scriptAuthor,
  series,
  speakerRole,
  speakerRolePart,
  speaks,
  track,
  version,
}
