import Link from 'next/link'
import React from 'react'
import { getScriptUntilPart } from '~/actions/scripts'
import Label from '~/components/Label'
import type { Episode } from '~/utils/types'

type RoleIndicatorProps = {
  speach: { role: string; content: string }
  episode: Episode
}

function Speach({ speach, episode }: RoleIndicatorProps) {
  const [prefix, characterName] = speach.role.split(':')

  const isAmbient = prefix === 'ambient'

  const speaker = episode.cast
    .values()
    .find((speaker) => speaker.role === characterName)

  return (
    <li className={`px-4 py-2 ${!isAmbient ? 'bg-gray-50' : ''}`}>
      <blockquote className={isAmbient ? 'text-center italic' : ''}>
        <span className="font-bold text-gray-400 text-lg">„</span>
        {speach.content}
        <span className="font-bold text-gray-400 text-lg">“</span>
      </blockquote>

      {!isAmbient && (
        <cite className="text-gray-500 text-sm not-italic">
          {speaker && (
            <Link
              className="underline"
              href={`/people/${speaker.id}`}
              prefetch={true}
            >
              {characterName}
            </Link>
          )}

          {!speaker && 'Unbekannt'}
        </cite>
      )}
    </li>
  )
}

type ScriptProps = {
  episode: Episode
  page: number
}

export default async function Script({ episode, page }: ScriptProps) {
  const script = await getScriptUntilPart(episode.id, page - 1)

  if (!script)
    return (
      <Label className="text-wrap" description="Skript">
        Kein Skript steht zur Verfügung
      </Label>
    )

  return (
    <Label className="max-h-screen text-wrap" description="Skript">
      <p className="mb-4">
        Dieses Skript wurde mithilfe von K.I. autogeneriert. Es kann Fehler
        enthalten, besonders in der Sprechererkennung:
      </p>

      <ol className="mb-4 max-h-64 space-y-4 overflow-y-auto border border-gray-200 sm:max-h-96">
        {script.map((speach, i) => (
          <React.Fragment key={`speach/${i.toString()}`}>
            <Speach episode={episode} speach={speach} />
          </React.Fragment>
        ))}
      </ol>

      <Link
        className="text-gray-500 underline"
        href={`?page=${page + 1}`}
        prefetch={true}
      >
        Mehr laden...
      </Link>
    </Label>
  )
}
