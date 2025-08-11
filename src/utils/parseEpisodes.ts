import type { Author, Episode, RawEpisodeResult, Speaker, Track } from './types'

/** chunk raw results into parsed episodes */
export function parseEpisodes(raw: RawEpisodeResult[]) {
  const episodes: Episode[] = []

  function isSameEpisodeGroup(
    current: RawEpisodeResult,
    next: RawEpisodeResult | undefined,
  ): boolean {
    if (!next) return false

    if (current.metadata.id === next.part?.parentID) return true

    if (next.metadata.id === current.part?.parentID) return true

    if (
      current.part?.parentID &&
      next.part?.parentID &&
      current.part.parentID === next.part.parentID
    )
      return true

    return false
  }

  // chunk into raw episode results and parse
  let rawEpisodes: RawEpisodeResult[] = []
  for (let idx = 0; idx < raw.length; idx += 1) {
    const current = raw[idx]
    const next = raw[idx + 1]

    rawEpisodes.push(current)

    if (
      current.metadata.id !== next?.metadata?.id &&
      !isSameEpisodeGroup(current, next)
    ) {
      const episode = parseSingleEpisode(rawEpisodes)
      if (episode) episodes.push(episode)

      rawEpisodes = []
    }
  }

  return episodes
}

function parseSingleEpisode(result: RawEpisodeResult[]): Episode | null {
  const rawData = result[0]

  if (
    rawData.part.parentID !== null &&
    rawData.part.parentID !== rawData.metadata.id
  )
    return null

  const id = rawData.metadata.id
  const number = rawData.metadata.number
  const formattedID = String(rawData.metadata.number).padStart(3, '0')
  const title = rawData.metadata.title
  const description = rawData.metadata.description
  const coverImage = `https://assets.ddf-archiv.de/covers/${number}.png`
  const releaseDate = new Date(rawData.metadata.releaseDate)

  const parts = new Map<number, string>()
  const preTracks = new Map<string, Omit<Track, 'part'> & { part: number }>() // unorderd tracks w/o parts associated
  const numberOfTracks: number[] = [0, 0, 0] // tracks per part -> e.g. 'A', 'B', 'C': [6,6,6]

  const cast = new Map<number, Speaker>()
  const bookAuthors = new Map<number, Author>()
  const scriptAuthors = new Map<number, Author>()

  for (const row of result) {
    const speaker = {
      id: row.cast.id,
      name: row.cast.name,
      pseudonym: row.cast.pseudonym,
      role: row.cast.role,
    }

    const bookAuthor = {
      id: row.bookAuthor.id,
      name: row.bookAuthor.name,
    }

    const scriptAuthor = {
      id: row.scriptAuthor.id,
      name: row.scriptAuthor.name,
    }

    const track = {
      duration: row.track.duration,
      position: row.track.position,
      title: row.track.title,
      part: row.track.part,
    }

    if (track.title !== null && !preTracks.has(track.title)) {
      numberOfTracks[track.part - 1] += 1
      preTracks.set(track.title, track)
    }

    if (row.part.episodeID) {
      parts.set(row.part.episodeID, '')
    }

    if (parts.has(row.metadata.id)) {
      parts.set(row.metadata.id, row.metadata.title)
    }

    if (speaker.id !== null) {
      cast.set(speaker.id, speaker)
    }

    if (bookAuthor.id !== null) {
      bookAuthors.set(bookAuthor.id, bookAuthor)
    }

    if (scriptAuthor.id !== null) {
      scriptAuthors.set(scriptAuthor.id, scriptAuthor)
    }
  }

  const partsArray = Array.from(parts.values())
  const tracksArray = Array.from(preTracks.values()).toSorted(
    (a, b) => 100 * b.part + b.position - (100 * a.part + a.position),
  )

  let totalDuration = 0
  const tracks = new Map<number, Track>()

  for (let i = 0; i < tracksArray.length; i += 1) {
    const track = tracksArray[i]

    totalDuration += track.duration

    const previousNumberOfTracks = numberOfTracks
      .slice(0, track.part - 1)
      .reduce((acc, cur) => acc + cur, 0)

    const position = previousNumberOfTracks + track.position
    const part = partsArray.at(track.part - 1) || null
    tracks.set(position, { ...track, part })
  }

  return {
    number,
    bookAuthors,
    cast,
    coverImage,
    description,
    formattedID,
    id,
    parts: partsArray.length > 0 ? new Set(partsArray) : null,
    releaseDate,
    scriptAuthors,
    title,
    totalDuration,
    tracks,
  }
}
