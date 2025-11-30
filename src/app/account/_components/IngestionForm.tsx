'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import {
  addNextPart,
  getIngestionSession as getIngestionSessionAction,
  linkIngestionSession,
  markFileAsUpdating,
  removeIngestionPart,
  removeIngestionSession,
} from '~/actions/ingestion'
import Button from '~/components/Button'
import Select from '~/components/Select'
import type { IngestionSession } from '~/utils/types'
import IngestionParts from './IngestionParts'

type IngestionFormProps = {
  sessionId: string
  missingEpisodes: { number: number; title: string }[]
}

const STATUS_DESCRIPTION = {
  pending: 'Wähle zuerst eine Episode aus, die du verfollständigen möchtest.',
  created:
    'Lade die Audio-Dateien der Episode hoch. Bitte beachte die Reihenfolge der Dateien.',
  completed:
    'Die Folge wurde erfolgreich verarbeitet. Danke für deine Unterstüzung!',
  failed:
    'Ein Fehler ist in der Verarbeitung aufgetreten. Bitte versuche es später erneut.',
} as const

export type IngestionSessionMutations =
  | {
      type: 'linkSession'
      payload: { episodeNumber: number }
    }
  | { type: 'removeSession' }
  | { type: 'addPart' }
  | {
      type: 'removePart'
      payload: { partId: string }
    }
  | {
      type: 'uploadFile'
      payload: { uploadUrl: string; file: File; fileId: string }
    }

export type MutationTrigger =
  | 'linkSession'
  | 'addPart'
  | 'startPipeline'
  | 'removeSession'
  | 'parts'
  | null

export default function IngestionForm({
  missingEpisodes,
  sessionId,
}: IngestionFormProps) {
  const [mutationTrigger, setMutationTrigger] =
    React.useState<MutationTrigger>(null)

  const queryClient = useQueryClient()

  const {
    data: ingestionSession,
    isPending: isLoadingSession,
    refetch: refetchIngestionSession,
  } = useQuery({
    queryKey: ['getIngestionSession', sessionId],
    queryFn: async () => {
      console.log('calling action')
      const result = await getIngestionSessionAction({ sessionId })

      console.log(`result ${result.success}`)

      return 'data' in result ? result.data : null
    },
    initialData: null,
    staleTime: 0,
    refetchInterval: 5000,
  })

  const { isPending: isUpdatingSession, mutate: updateSession } = useMutation({
    mutationKey: ['updateIngestionSession', sessionId],
    onMutate: async (variables: IngestionSessionMutations) => {
      const queryKey = ['getIngestionSession', sessionId]
      await queryClient.cancelQueries({ queryKey })

      if (variables.type === 'linkSession') {
        setMutationTrigger('linkSession')

        const { episodeNumber } = variables.payload
        queryClient.setQueryData(queryKey, () => ({ episodeNumber }))
      }
      if (variables.type === 'removeSession') {
        setMutationTrigger('removeSession')
      }
      //
      else if (variables.type === 'addPart') {
        setMutationTrigger('addPart')
      } else if (variables.type === 'removePart') {
        setMutationTrigger('parts')

        queryClient.setQueryData(
          queryKey,
          (previous: IngestionSession | null) => {
            if (!previous) return null

            const idx = previous.parts.findIndex(
              (part) => part.id === variables.payload.partId,
            )

            previous.parts[idx].status = 'deleting'

            return previous
          },
        )
      }
      //
      else if (variables.type === 'uploadFile') {
        setMutationTrigger('parts')

        const { file } = variables.payload
        queryClient.setQueryData(
          queryKey,
          (previous: IngestionSession | null) => {
            if (!previous) return null

            const idx = previous.parts.findIndex(
              (part) => part.file?.uploadUrl === variables.payload.uploadUrl,
            )

            if (previous.parts[idx].file) {
              previous.parts[idx].file!.fileName = file.name
            }
            previous.parts[idx].status = 'uploading'

            return previous
          },
        )
      }
    },
    mutationFn: async (variables: IngestionSessionMutations) => {
      if (variables.type === 'linkSession') {
        const { episodeNumber } = variables.payload
        const result = await linkIngestionSession({ episodeNumber, sessionId })
        if (!result.success) throw new Error('Could not link session.')

        await refetchIngestionSession()
      }
      //
      else if (variables.type === 'removeSession') {
        const result = await removeIngestionSession({ sessionId })
        if (!result.success) throw new Error('Could not remove session.')

        await refetchIngestionSession()
      }
      //
      else if (variables.type === 'addPart') {
        const result = await addNextPart({ sessionId })
        if (!result.success) throw new Error('Could not append new part.')

        await refetchIngestionSession()
      }
      //
      else if (variables.type === 'removePart') {
        const { partId } = variables.payload
        const result = await removeIngestionPart({ partId })
        if (!result.success) throw new Error('Could not remove part.')

        await refetchIngestionSession()
      }
      //
      else if (variables.type === 'uploadFile') {
        const { file, uploadUrl, fileId } = variables.payload

        await markFileAsUpdating({ fileName: file.name, fileId })

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) throw new Error('Could not upload file.')
      }
    },
  })

  const episodeOptions = React.useMemo(() => {
    const episodeOptions = new Map<string, React.ReactNode>()
    for (const episode of missingEpisodes) {
      episodeOptions.set(
        episode.number.toString(),
        <div className="flex gap-4 items-center" key={episode.number}>
          <span className="text-gray-500 font-normal">
            {String(episode.number).padStart(3, '0')}
          </span>

          <span className="font-medium truncate normal-case">
            {episode.title}
          </span>
        </div>,
      )
    }

    return episodeOptions
  }, [missingEpisodes])

  return (
    <section className="space-y-2">
      <h4 className="uppercase font-medium text-lg text-gray-500">
        Horspiele und Skripte
      </h4>

      <p>
        Aktuell ist unser Archiv noch nicht vollstandig, manche Transkripte sind
        fehlerhaft oder noch nicht vorhanden. Darum bitten wir um eine
        Datenspende, entweder in Form von Audiodateien oder als vorgefertigktes
        Transkript.
        <br />
        Gerne stellen wir die Transkripte auf Nachfrage fur andere Entwickler
        zur Verfugung.
      </p>

      <div className="flex gap-4">
        <Select
          triggerProps={{ mode: 'outlined' }}
          options={episodeOptions}
          disabled={ingestionSession !== null}
          value={
            typeof ingestionSession?.episodeNumber === 'number'
              ? String(ingestionSession.episodeNumber)
              : ''
          }
          onValueChange={(episodeNumber) => {
            updateSession({
              type: 'linkSession',
              payload: { episodeNumber: Number(episodeNumber) },
            })
          }}
          loading={
            mutationTrigger === 'linkSession' &&
            (isLoadingSession || isUpdatingSession)
          }
        >
          Folge auswahlen
        </Select>

        <Button
          disabled={
            !['created', 'processing'].includes(
              ingestionSession?.status || '',
            ) || isUpdatingSession
          }
          mode="outlined"
          loading={mutationTrigger === 'addPart' && isUpdatingSession}
          onClick={() => updateSession({ type: 'addPart' })}
        >
          Audiodatei hinzufugen
        </Button>

        <Button
          disabled={
            !ingestionSession ||
            isUpdatingSession ||
            ingestionSession?.parts?.length === 0
          }
        >
          Horspiel analysieren
        </Button>

        <Button
          disabled={!ingestionSession || isUpdatingSession}
          loading={mutationTrigger === 'removeSession' && isUpdatingSession}
          onClick={() => updateSession({ type: 'removeSession' })}
          mode="destructive"
        >
          Auswahl aufheben
        </Button>
      </div>

      <p>{STATUS_DESCRIPTION[ingestionSession?.status || 'pending']}</p>

      <IngestionParts
        isUpdatingSession={isUpdatingSession}
        ingestionSession={ingestionSession}
        updateSession={updateSession}
      />
    </section>
  )
}
