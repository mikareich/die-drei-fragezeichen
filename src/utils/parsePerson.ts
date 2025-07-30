import type { Episode, Person, Speaker } from '~/utils/types'

export function parsePerson(id: number, episodes: Episode[]): Person {
  let name: string = ''
  const roles = new Set<string>()
  const pseudonyms = new Set<string>()
  const episodesCasted = new Map<number, Episode>()
  const booksAuthored = new Map<number, Episode>()
  const scriptsAuthored = new Map<number, Episode>()

  for (const episode of episodes) {
    if (episode.cast.has(id)) {
      const speaker = episode.cast.get(id) as Speaker
      name = speaker.name
      roles.add(episode.cast.get(id)?.role as string)
      episodesCasted.set(episode.id, episode)
      if (speaker.pseudonym) pseudonyms.add(speaker.pseudonym)
    }

    if (episode.bookAuthors.has(id)) {
      name = episode.bookAuthors.get(id)?.name as string
      roles.add('Autor')
      booksAuthored.set(episode.id, episode)
    }

    if (episode.scriptAuthors.has(id)) {
      name = episode.scriptAuthors.get(id)?.name as string
      roles.add('Autor')
      scriptsAuthored.set(episode.id, episode)
    }
  }

  const contributed = new Map([
    ...episodesCasted,
    ...booksAuthored,
    ...scriptsAuthored,
  ]).size

  return {
    booksAuthored,
    episodesCasted,
    id,
    name,
    pseudonyms,
    roles,
    scriptsAuthored,
    contributed,
  }
}
