INSERT
OR REPLACE INTO episode_view (
  description,
  episodeId,
  number,
  releaseDate,
  title,
  trackDuration,
  trackPosition,
  trackTitle,
  trackPart,
  castPersonId,
  castName,
  castPseudonym,
  castRole,
  bookAuthorId,
  bookAuthorName,
  scriptAuthorId,
  scriptAuthorName
)
SELECT DISTINCT
  "metadataDescription",
  "metadataID",
  "metadataNumber",
  "metadataReleaseDate",
  "metadataTitle",
  "trackDuration",
  "trackPosition",
  "trackTitle",
  "trackPart",
  "castPersonID",
  "castName",
  "castPseudonym",
  "castRole",
  "bookAuthorId",
  "bookAuthorName",
  "scriptAuthorID",
  "scriptAuthorName" "scriptAuthorName"
FROM
  (
    SELECT
      "hörspiel"."beschreibung" as "metadataDescription",
      "hörspiel"."hörspielID" as "metadataID",
      "serie"."nummer" as "metadataNumber",
      "hörspiel"."veröffentlichungsdatum" as "metadataReleaseDate",
      "hörspiel"."titel" as "metadataTitle"
    FROM
      "hörspiel"
      LEFT JOIN "serie" ON "hörspiel"."hörspielID" = "serie"."hörspielID"
      LEFT JOIN "medium" ON "medium"."hörspielID" = "hörspiel"."hörspielID"
      LEFT JOIN "hörspielTeil" ON (
        "hörspielTeil"."hörspiel" = "hörspiel"."hörspielID"
        AND "hörspielTeil"."position" = "medium"."position"
      )
    WHERE
      (
        "hörspiel"."unvollständig" = 0
        AND EXISTS (
          SELECT
            1
          FROM
            "serie"
          WHERE
            "serie"."hörspielID" = "hörspiel"."hörspielID"
        )
        -- Exclude child episodes (episodes that are parts of other episodes)
        AND NOT EXISTS (
          SELECT
            1
          FROM
            "hörspielTeil"
          WHERE
            "hörspielTeil"."teil" = "hörspiel"."hörspielID"
        )
      )
  ) "metadata"
  LEFT JOIN (
    SELECT
      "track"."dauer" as "trackDuration",
      "hörspiel"."hörspielID" as "trackEpisodeID",
      "track"."position" as "trackPosition",
      "track"."titel" as "trackTitle",
      "medium"."position" as "trackPart"
    FROM
      "hörspiel"
      LEFT JOIN "medium" ON "medium"."hörspielID" = "hörspiel"."hörspielID"
      INNER JOIN "track" ON "track"."mediumID" = "medium"."mediumID"
      -- Exclude child episodes
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
    WHERE
      "hörspielTeil"."teil" IS NULL
      -- TODO: Handle nested episodes differently
      -- UNION ALL approach creates too much data (66k instead of 33k rows)
      -- Consider: filtering out nested episodes entirely since their data 
      -- is already encoded in the parent episode
      -- UNION ALL
      -- 
      -- -- For nested episodes, get tracks from the parent episode
      -- SELECT 
      --   "track"."dauer" as "trackDuration",
      --   "child"."teil" as "trackEpisodeID",
      --   "track"."position" as "trackPosition",
      --   "track"."titel" as "trackTitle",
      --   "medium"."position" as "trackPart"
      -- FROM "hörspielTeil" "child"
      -- LEFT JOIN "hörspiel" "parent" ON "parent"."hörspielID" = "child"."hörspiel"
      -- LEFT JOIN "medium" ON "medium"."hörspielID" = "parent"."hörspielID"
      -- INNER JOIN "track" ON "track"."mediumID" = "medium"."mediumID"
  ) "track" ON "trackEpisodeID" = "metadataID"
  LEFT JOIN (
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
      -- TODO: Handle nested episodes differently
      -- UNION ALL approach creates too much data (66k instead of 33k rows)
      -- Consider: filtering out nested episodes entirely since their data 
      -- is already encoded in the parent episode
      -- UNION ALL
      -- 
      -- -- For nested episodes, get cast from the parent episode
      -- SELECT 
      --   "child"."teil" as "castEpisodeID",
      --   "person"."personID" as "castPersonID",
      --   "person"."name" as "castName",
      --   "pseudonym"."name" as "castPseudonym",
      --   "rolle"."name" as "castRole"
      -- FROM "hörspielTeil" "child"
      -- LEFT JOIN "hörspiel" "parent" ON "parent"."hörspielID" = "child"."hörspiel"
      -- LEFT JOIN "sprechrolle" ON "sprechrolle"."hörspielID" = "parent"."hörspielID"
      -- LEFT JOIN "spricht" ON "spricht"."sprechrolleID" = "sprechrolle"."sprechrolleID"
      -- INNER JOIN "rolle" ON "rolle"."rolleID" = "sprechrolle"."rolleID"
      -- INNER JOIN "person" ON "person"."personID" = "spricht"."personID"
      -- LEFT JOIN "pseudonym" ON "pseudonym"."pseudonymID" = "spricht"."pseudonymID"
  ) "cast" ON "castEpisodeID" = "metadataID"
  LEFT JOIN (
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
  ) "bookAuthor" ON "bookAuthorEpisodeID" = "metadataID"
  LEFT JOIN (
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
  ) "scriptAuthor" ON "scriptAuthorEpisodeID" = "metadataID"