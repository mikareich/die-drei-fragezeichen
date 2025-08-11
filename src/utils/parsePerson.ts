import type { Episode, EpisodeView, PeopleView, Person } from '~/utils/types'
import { parseEpisodes } from './parseEpisode'

type JoinedPersonResult = {
  people_view: PeopleView
  episode_view: EpisodeView | null
}

export function parsePeople(rawPeople: JoinedPersonResult[]): Person[] {
  const people: Person[] = []

  let personResults: JoinedPersonResult[] = []
  for (let idx = 0; idx < rawPeople.length; idx += 1) {
    const current = rawPeople[idx]
    const next = rawPeople[idx + 1]

    personResults.push(current)

    if (current.people_view.id !== next?.people_view?.id) {
      const person = parseSinglePerson(personResults)
      if (person) people.push(person)

      personResults = []
    }
  }

  return people
}

export function parsePerson(rawPeople: JoinedPersonResult[]): Person | null {
  const people = parsePeople(rawPeople)
  return people[0] || null
}

function parseSinglePerson(result: JoinedPersonResult[]): Person | null {
  const rawData = result[0]
  const personView = rawData.people_view

  const episodeData = result
    .map((row) => row.episode_view)
    .filter(
      (episode): episode is NonNullable<typeof episode> => episode !== null,
    )

  const episodes = parseEpisodes(episodeData)

  const roles = new Set<string>(
    personView.roles ? personView.roles.split(',').filter(Boolean) : [],
  )
  const pseudonyms = new Set<string>(
    personView.pseudonyms
      ? personView.pseudonyms.split(',').filter(Boolean)
      : [],
  )
  const episodesCasted = new Map<number, Episode>()
  const booksAuthored = new Map<number, Episode>()
  const scriptsAuthored = new Map<number, Episode>()

  let hasAuthorRole = false

  for (const episode of episodes) {
    if (episode.cast.has(personView.id)) {
      episodesCasted.set(episode.id, episode)
    }
    if (episode.bookAuthors.has(personView.id)) {
      booksAuthored.set(episode.id, episode)
      hasAuthorRole = true
    }
    if (episode.scriptAuthors.has(personView.id)) {
      scriptsAuthored.set(episode.id, episode)
      hasAuthorRole = true
    }
  }

  if (hasAuthorRole) {
    roles.add('Autor')
  }

  return {
    id: personView.id,
    name: personView.name,
    roles,
    pseudonyms,
    episodesCasted,
    booksAuthored,
    scriptsAuthored,
    contributed: personView.contributed,
  }
}
