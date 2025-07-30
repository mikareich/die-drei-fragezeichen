import Image from 'next/image'
import Label from '~/components/Label'
import { LOC_NA_CONTENT } from '~/utils/constants'
import { DATE_FORMAT, formatAbsoluteTime, LIST_FORMAT } from '~/utils/format'
import type { Episode } from '~/utils/types'

type HeaderProps = {
  episode: Episode
}

export default function Header({ episode }: HeaderProps) {
  const authors = new Set([
    ...episode.bookAuthors.values(),
    ...episode.scriptAuthors.values(),
  ])
    .values()
    .toArray()
    .map((author) => author.name)

  return (
    <header className="grid grid-cols-[1fr_auto] grid-rows-[1fr_auto] gap-x-16 gap-y-8 overflow-hidden overflow-y-hidden border-gray-200 border-b pb-4">
      <Label
        className="h-fit self-end overflow-visible whitespace-normal"
        description={<span className="text-lg">Die Drei ???</span>}
      >
        <h1 className="break-words font-bold text-5xl">{episode.title}</h1>
      </Label>

      <div className="relative aspect-square h-full max-sm:hidden sm:min-h-42 lg:row-span-2">
        <Image alt={`${episode.title} - Cover`} fill src={episode.coverImage} />
      </div>

      <div className="flex items-end justify-between gap-4 overflow-y-hidden max-lg:col-span-2 lg:flex-wrap">
        <Label description="Nummer">
          <h6 className="truncate font-medium">{episode.formattedID}</h6>
        </Label>

        <Label description="Länge">
          <h6 className="truncate font-medium">
            {formatAbsoluteTime(episode.totalDuration)}
          </h6>
        </Label>

        <Label description="Autoren">
          <h6 className="truncate font-medium">
            {LIST_FORMAT.format(authors) || LOC_NA_CONTENT}
          </h6>
        </Label>

        <Label description="Veröffentlichungsdatum">
          <h6 className="truncate font-medium">
            {DATE_FORMAT.format(episode.releaseDate)}
          </h6>
        </Label>
      </div>
    </header>
  )
}
