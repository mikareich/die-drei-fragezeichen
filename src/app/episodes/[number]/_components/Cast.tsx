import Link from 'next/link'
import Label from '~/components/Label'
import type { Episode } from '~/utils/types'

type CastProps = {
  episode: Episode
}

export default function Cast({ episode }: CastProps) {
  return (
    <Label description="Besetzung">
      <p className="mb-4 text-wrap">
        In dieser Folge haben insgesamt{' '}
        <span className="font-bold">{episode.cast.size}</span> Personen
        gesprochen:
      </p>

      <ul className="flex w-full flex-wrap gap-4 overflow-hidden truncate">
        {Array.from(episode.cast.values()).map(({ role, name, id }) => (
          <li className="truncate underline" key={`cast/${role}/${id}`}>
            <Link href={`/people/${id}`} prefetch={true}>
              {role} - {name}
            </Link>
          </li>
        ))}
      </ul>
    </Label>
  )
}
