import Label from '~/components/Label'
import { formatAbsoluteTime } from '~/utils/format'
import type { Episode } from '~/utils/types'

type TracksProps = {
  episode: Episode
}

export default function Tracks({ episode }: TracksProps) {
  return (
    <Label description="Tracks">
      <p className="mb-4 text-wrap">
        Es gibt{' '}
        <span className="text-nowrap font-bold">
          {episode.tracks.size} Tracks
        </span>{' '}
        {episode.parts && (
          <>
            und{' '}
            <span className="text-nowrap font-bold">
              {episode.parts.size} Teile
            </span>{' '}
          </>
        )}
        mit einer insgesamten Dauer von{' '}
        <span className="text-nowrap font-bold">
          {formatAbsoluteTime(episode.totalDuration)}
        </span>
        :
      </p>

      <ol className="list-inside list-decimal space-y-1">
        {Array.from(episode.tracks.values()).map((track, idx) => (
          <li className="truncate" key={`track/${idx.toString()}`}>
            <span>{track.title}</span>{' '}
            <span className="text-gray-500">
              ({formatAbsoluteTime(track.duration)}
              {track.part ? `, Teil ${track.part}` : ''})
            </span>
          </li>
        ))}
      </ol>
    </Label>
  )
}
