import type { Author, Episode, EpisodeView, Speaker, Track } from './types'

export function parseEpisodes(rawEpisodes: EpisodeView[]) {
  const episodes: Episode[] = []

  let episodeResults: EpisodeView[] = []
  for (let idx = 0; idx < rawEpisodes.length; idx += 1) {
    const current = rawEpisodes[idx]
    const next = rawEpisodes[idx + 1]

    episodeResults.push(current)

    if (current.episodeId !== next?.episodeId) {
      const episode = parseEpisode(episodeResults)
      if (episode) episodes.push(episode)

      episodeResults = []
    }
  }

  return episodes
}

export function parseEpisode(result: EpisodeView[]): Episode | null {
  const rawData = result[0]

  const id = rawData.episodeId
  const number = rawData.number || 0
  const formattedID = String(rawData.number || 0).padStart(3, '0')
  const title = rawData.title
  const description = rawData.description || ''
  const coverImage = `https://assets.ddf-archiv.de/covers/${number}.png`
  const releaseDate = new Date(rawData.releaseDate || '')

  const preTracks = new Map<string, Omit<Track, 'part'> & { part: number }>() // unordered tracks w/o parts associated
  const numberOfTracks: number[] = [0, 0, 0] // tracks per part -> e.g. 'A', 'B', 'C': [6,6,6]
  const parts = new Set<string>()

  const cast = new Map<number, Speaker>()
  const bookAuthors = new Map<number, Author>()
  const scriptAuthors = new Map<number, Author>()

  for (const row of result) {
    const speaker = {
      id: row.castPersonId,
      name: row.castName,
      pseudonym: row.castPseudonym,
      role: row.castRole,
    }

    const bookAuthor = {
      id: row.bookAuthorId,
      name: row.bookAuthorName,
    }

    const scriptAuthor = {
      id: row.scriptAuthorId,
      name: row.scriptAuthorName,
    }

    const track = {
      duration: row.trackDuration,
      position: row.trackPosition,
      title: row.trackTitle,
      part: row.trackPart,
    }

    if (
      track.title !== null &&
      track.duration !== null &&
      track.position !== null &&
      track.part !== null &&
      !preTracks.has(track.title)
    ) {
      numberOfTracks[track.part - 1] += 1
      const partLetter = String.fromCharCode(64 + track.part) // Convert 1,2,3 to A,B,C
      parts.add(partLetter)
      preTracks.set(
        track.title,
        track as Omit<Track, 'part'> & { part: number },
      )
    }

    if (speaker.id !== null && speaker.name !== null && speaker.role !== null) {
      cast.set(speaker.id, speaker as Speaker)
    }

    if (bookAuthor.id !== null && bookAuthor.name !== null) {
      bookAuthors.set(bookAuthor.id, bookAuthor as Author)
    }

    if (scriptAuthor.id !== null && scriptAuthor.name !== null) {
      scriptAuthors.set(scriptAuthor.id, scriptAuthor as Author)
    }
  }

  // Since we removed part functionality, we simplify the parts handling
  const tracksArray = Array.from(preTracks.values()).toSorted(
    (a, b) => 100 * a.part + a.position - (100 * b.part + b.position),
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
    const part = String.fromCharCode(64 + track.part) // Convert 1,2,3 to A,B,C
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
    parts: parts.size > 0 ? parts : null,
    releaseDate,
    scriptAuthors,
    title,
    totalDuration,
    tracks,
  }
}
