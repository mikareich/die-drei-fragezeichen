import Link from 'next/link'
import Label from '~/components/Label'
import type { Person } from '~/utils/types'

type BooksAuthoredProps = {
  person: Person
}

export default function BooksAuthored({ person }: BooksAuthoredProps) {
  return (
    <Label description="Geschriebene Hörspielbücher">
      <p className="mb-4 text-wrap">
        <span className="text-nowrap">{person.name}</span> hat in{' '}
        <span className="text-nowrap font-bold">
          {person.booksAuthored.size} Folgen
        </span>{' '}
        das Buch geschrieben.
      </p>

      <div className="max-h-96 overflow-y-auto">
        <ol className="columns-1 space-x-6 space-y-6 md:columns-2 xl:columns-3">
          {Array.from(person.booksAuthored.values()).map((episode) => (
            <li className="truncate" key={`booksAuthored/${episode.id}`}>
              <span className="text-gray-700">{episode.formattedID}. </span>

              <Link
                className="font-bold underline"
                href={`/episodes/${episode.number}`}
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
