INSERT INTO
  people_view (id, name, roles, pseudonyms, contributed)
WITH
  person_data AS (
    -- Get all people with their basic info
    SELECT DISTINCT
      "person"."personID" as id,
      "person"."name" as name
    FROM
      "person"
  ),
  cast_data AS (
    -- Get casting information
    SELECT
      "person"."personID" as id,
      COUNT(DISTINCT "serie"."hörspielID") as episodesCasted,
      GROUP_CONCAT (DISTINCT "rolle"."name") as roles,
      GROUP_CONCAT (DISTINCT "pseudonym"."name") as pseudonyms
    FROM
      "person"
      LEFT JOIN "spricht" ON "spricht"."personID" = "person"."personID"
      LEFT JOIN "sprechrolle" ON "sprechrolle"."sprechrolleID" = "spricht"."sprechrolleID"
      LEFT JOIN "rolle" ON "rolle"."rolleID" = "sprechrolle"."rolleID"
      LEFT JOIN "pseudonym" ON "pseudonym"."pseudonymID" = "spricht"."pseudonymID"
      LEFT JOIN "hörspiel" ON "hörspiel"."hörspielID" = "sprechrolle"."hörspielID"
      LEFT JOIN "serie" ON "serie"."hörspielID" = "hörspiel"."hörspielID"
      -- Exclude child episodes
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
    WHERE
      "hörspielTeil"."teil" IS NULL
      AND "serie"."hörspielID" IS NOT NULL
    GROUP BY
      "person"."personID"
  ),
  book_author_data AS (
    -- Get book authoring information (including parent episodes from child episodes)
    SELECT
      "person"."personID" as id,
      COUNT(
        DISTINCT COALESCE(
          "hörspielTeil"."hörspiel",
          "hörspiel"."hörspielID"
        )
      ) as booksAuthored
    FROM
      "person"
      LEFT JOIN "hörspielBuchautor" ON "hörspielBuchautor"."personID" = "person"."personID"
      LEFT JOIN "hörspiel" ON "hörspiel"."hörspielID" = "hörspielBuchautor"."hörspielID"
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
      LEFT JOIN "serie" ON "serie"."hörspielID" = COALESCE(
        "hörspielTeil"."hörspiel",
        "hörspiel"."hörspielID"
      )
    WHERE
      "serie"."hörspielID" IS NOT NULL
    GROUP BY
      "person"."personID"
  ),
  script_author_data AS (
    -- Get script authoring information (including parent episodes from child episodes)
    SELECT
      "person"."personID" as id,
      COUNT(
        DISTINCT COALESCE(
          "hörspielTeil"."hörspiel",
          "hörspiel"."hörspielID"
        )
      ) as scriptsAuthored
    FROM
      "person"
      LEFT JOIN "hörspielSkriptautor" ON "hörspielSkriptautor"."personID" = "person"."personID"
      LEFT JOIN "hörspiel" ON "hörspiel"."hörspielID" = "hörspielSkriptautor"."hörspielID"
      LEFT JOIN "hörspielTeil" ON "hörspielTeil"."teil" = "hörspiel"."hörspielID"
      LEFT JOIN "serie" ON "serie"."hörspielID" = COALESCE(
        "hörspielTeil"."hörspiel",
        "hörspiel"."hörspielID"
      )
    WHERE
      "serie"."hörspielID" IS NOT NULL
    GROUP BY
      "person"."personID"
  )
SELECT
  p.id,
  p.name,
  COALESCE(c.roles, '') as roles,
  COALESCE(c.pseudonyms, '') as pseudonyms,
  (
    COALESCE(c.episodesCasted, 0) + COALESCE(b.booksAuthored, 0) + COALESCE(s.scriptsAuthored, 0)
  ) as contributed
FROM
  person_data p
  LEFT JOIN cast_data c ON c.id = p.id
  LEFT JOIN book_author_data b ON b.id = p.id
  LEFT JOIN script_author_data s ON s.id = p.id
WHERE
  (
    COALESCE(c.episodesCasted, 0) + COALESCE(b.booksAuthored, 0) + COALESCE(s.scriptsAuthored, 0)
  ) > 0
ORDER BY
  p.name