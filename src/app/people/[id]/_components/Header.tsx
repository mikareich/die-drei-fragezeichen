import Label from '~/components/Label'
import { LOC_NA_CONTENT } from '~/utils/constants'
import { DATE_FORMAT, LIST_FORMAT } from '~/utils/format'
import type { Person } from '~/utils/types'

type HeaderProps = {
  person: Person
}

export default function Header({ person }: HeaderProps) {
  const allEpisodes = new Map([
    ...person.episodesCasted,
    ...person.booksAuthored,
    ...person.scriptsAuthored,
  ])

  const roles = new Set<string>()
  if (
    person.roles.has('Autor') ||
    person.booksAuthored.size > 0 ||
    person.scriptsAuthored.size > 0
  ) {
    roles.add('Autor')
  }
  if (person.episodesCasted.size > 0) roles.add('Synchronsprecher')

  const episodes = Array.from(allEpisodes.values())
  const firstEpisode =
    episodes.length > 0
      ? episodes.reduce((acc, ep) =>
          ep.releaseDate < acc.releaseDate ? ep : acc,
        )
      : null

  return (
    <header className="space-y-8 border-gray-200 border-b pb-4">
      <Label
        className="flex flex-col justify-end text-wrap sm:min-h-34"
        description={<span className="text-lg">Die Drei ???</span>}
      >
        <h1 className="break-words font-bold text-5xl">{person.name}</h1>
      </Label>

      <div className="flex items-end justify-between gap-4 overflow-y-hidden max-lg:col-span-2 lg:flex-wrap">
        <Label description="Erste Folge">
          <h6 className="truncate font-medium">
            {firstEpisode
              ? DATE_FORMAT.format(firstEpisode.releaseDate)
              : LOC_NA_CONTENT}
          </h6>
        </Label>

        <Label description="Mitgewirkte Folgen">
          <h6 className="truncate font-medium">{allEpisodes.size}x</h6>
        </Label>

        <Label description="Pseudonyme">
          <h6 className="truncate font-medium">
            {LIST_FORMAT.format(person.pseudonyms) || LOC_NA_CONTENT}
          </h6>
        </Label>

        <Label description="Rollen">
          <h6 className="truncate font-medium">
            {LIST_FORMAT.format(roles) || LOC_NA_CONTENT}
          </h6>
        </Label>
      </div>
    </header>
  )
}
