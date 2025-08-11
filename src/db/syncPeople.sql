INSERT INTO
  people_view (id, name)
SELECT
  "castPersonID" as id,
  "castName" as name
FROM
  (
    SELECT
      "hörspiel"."hörspielID" as "castEpisodeID",
      "person"."personID" as "castPersonID",
      "person"."name" as "castName",
      "pseudonym"."name" as "castPseudonym",
      "rolle"."name" as "castRole"
    FROM
      "hörspiel"
      LEFT JOIN "sprechrolle" ON "sprechrolle"."hörspielID" = "hörspiel"."hörspielID"
      LEFT JOIN "spricht" ON "spricht"."sprechrolleID" = "sprechrolle"."sprechrolleID"
      INNER JOIN "rolle" ON "rolle"."rolleID" = "sprechrolle"."rolleID"
      INNER JOIN "person" ON "person"."personID" = "spricht"."personID"
      LEFT JOIN "pseudonym" ON "pseudonym"."pseudonymID" = "spricht"."pseudonymID"
      -- Exclude child episodes
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
    WHERE
      "hörspielTeil"."teil" IS NULL
  ) "cast"
  INNER JOIN "serie" ON "serie"."hörspielID" = "castEpisodeID"
  -- Exclude child episodes
  LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "castEpisodeID"
WHERE
  "hörspielTeil"."teil" IS NULL
UNION
SELECT
  "bookAuthorId" as id,
  "bookAuthorName" as name
FROM
  (
    SELECT
      "hörspiel"."hörspielID" as "bookAuthorEpisodeID",
      "person"."personID" as "bookAuthorId",
      "person"."name" as "bookAuthorName"
    FROM
      "hörspiel"
      LEFT JOIN "hörspielBuchautor" ON "hörspielBuchautor"."hörspielID" = "hörspiel"."hörspielID"
      INNER JOIN "person" ON "person"."personID" = "hörspielBuchautor"."personID"
      -- Exclude child episodes (they will be handled in the UNION below)
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
    WHERE
      "hörspielTeil"."teil" IS NULL
    UNION
    -- Include authors from child episodes, attributed to their parent episode
    SELECT
      "hörspielTeil"."hörspiel" as "bookAuthorEpisodeID",
      "person"."personID" as "bookAuthorId",
      "person"."name" as "bookAuthorName"
    FROM
      "hörspielTeil"
      INNER JOIN "hörspiel" "childEpisode" ON "childEpisode"."hörspielID" = "hörspielTeil"."teil"
      LEFT JOIN "hörspielBuchautor" ON "hörspielBuchautor"."hörspielID" = "childEpisode"."hörspielID"
      INNER JOIN "person" ON "person"."personID" = "hörspielBuchautor"."personID"
  ) "bookAuthor"
  INNER JOIN "serie" ON "serie"."hörspielID" = "bookAuthorEpisodeID"
UNION
SELECT
  "scriptAuthorID" as id,
  "scriptAuthorName" as name
FROM
  (
    SELECT
      "hörspiel"."hörspielID" as "scriptAuthorEpisodeID",
      "person"."personID" as "scriptAuthorID",
      "person"."name" as "scriptAuthorName"
    FROM
      "hörspiel"
      LEFT JOIN "hörspielSkriptautor" ON "hörspielSkriptautor"."hörspielID" = "hörspiel"."hörspielID"
      INNER JOIN "person" ON "person"."personID" = "hörspielSkriptautor"."personID"
      -- Exclude child episodes (they will be handled in the UNION below)
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
    WHERE
      "hörspielTeil"."teil" IS NULL
    UNION
    -- Include authors from child episodes, attributed to their parent episode
    SELECT
      "hörspielTeil"."hörspiel" as "scriptAuthorEpisodeID",
      "person"."personID" as "scriptAuthorID",
      "person"."name" as "scriptAuthorName"
    FROM
      "hörspielTeil"
      INNER JOIN "hörspiel" "childEpisode" ON "childEpisode"."hörspielID" = "hörspielTeil"."teil"
      LEFT JOIN "hörspielSkriptautor" ON "hörspielSkriptautor"."hörspielID" = "childEpisode"."hörspielID"
      INNER JOIN "person" ON "person"."personID" = "hörspielSkriptautor"."personID"
  ) "scriptAuthor"
  INNER JOIN "serie" ON "serie"."hörspielID" = "scriptAuthorEpisodeID"