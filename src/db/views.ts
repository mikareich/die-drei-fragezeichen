import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const episodeView = sqliteTable(
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

export const peopleView = sqliteTable(
  'people_view',
  {
    id: integer().notNull(),
    name: text().notNull(),
    roles: text(), // JSON string of roles
    pseudonyms: text(), // JSON string of pseudonyms
    contributed: integer().notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.id] })],
)

export const views = {
  episodeView,
  peopleView,
}
