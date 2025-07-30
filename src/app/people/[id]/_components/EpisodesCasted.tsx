import Link from 'next/link'
import Label from '~/components/Label'
import type { Episode, Person } from '~/utils/types'

type EpisodesCastedProps = {
  person: Person
}

export default function EpisodesCasted({ person }: EpisodesCastedProps) {
  const roles = Array.from(person.episodesCasted.values())
    .reduce(
      (acc, episode) => [
        ...acc,
        { episode, role: episode.cast.get(person.id)?.role },
      ],
      [] as { episode: Episode; role: string | undefined }[],
    )

  return (
    <Label description="Synchronisierte Folgen">
      <p className="mb-4 text-wrap">
        <span className="text-nowrap">{person.name}</span> hat in{' '}
        <span className="text-nowrap font-bold">
          {person.episodesCasted.size} Folgen
        </span>{' '}
        mitgespielt.
      </p>

      <div className="max-h-96 overflow-y-auto">
        <ol className="columns-1 space-x-6 space-y-6 md:columns-2 xl:columns-3">
          {roles.map(({ role, episode }) => (
            <li
              className="truncate"
              key={`episodesCasted/${episode.id}/${role}`}
            >
              <span className="text-gray-700">{episode.formattedID}. </span>
              <Link
                className="font-bold underline"
                href={`/episodes/${episode.formattedID}`}
                prefetch={true}
              >
                {episode.title}
              </Link>{' '}
              als <span>{role}</span>
            </li>
          ))}
        </ol>
      </div>
    </Label>
  )
}
