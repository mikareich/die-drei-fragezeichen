import Link from 'next/link'
import type { Person } from '~/utils/types'
import Label from '~/components/Label'

type ScriptsAuthoredProps = {
  person: Person
}

export default function ScriptsAuthored({ person }: ScriptsAuthoredProps) {
  return (
    <Label description="Geschriebene Hörspielskripte">
      <p className="mb-4 text-wrap">
        <span className="text-nowrap">{person.name}</span> hat in{' '}
        <span className="text-nowrap font-bold">
          {person.scriptsAuthored.size} Folgen
        </span>{' '}
        das Skript geschrieben.
      </p>

      <div className="max-h-96 overflow-y-auto">
        <ol className="columns-1 space-x-6 space-y-6 md:columns-2 xl:columns-3">
          {Array.from(person.scriptsAuthored.values()).map((episode) => (
            <li className="truncate" key={`scriptsAuthored/${episode.id}`}>
              <span className="text-gray-700">{episode.formattedID}. </span>

              <Link
                className="font-bold underline"
                href={`/episodes/${episode.formattedID}`}
                prefetch={true}
              >
                {episode.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </Label>
  )
}
