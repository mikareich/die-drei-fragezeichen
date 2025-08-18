'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import Button from '~/components/Button'
import Select from '~/components/Select'
import { getUploadURL } from '../actions'
import FileItem from './File'

export type AudioFile = {
  uploadUrl: string
  id: string
  part: number
  status: 'selecting' | 'uploading' | 'uploaded' | 'processing' | 'canceled'
  file: File | null
}

const MODES = {
  episode: 'Wahle zuerst die Folge aus, die du hochladen mochtest.',
  files: (
    <React.Fragment>
      Wahle nun die Audiodateien hoch.{' '}
      <span className="underline">
        Bitte beachte unbedingt die Reihenfolge der Dateien
      </span>
      , ansonsten konnen die Daten nicht verarbeitet werden!
    </React.Fragment>
  ),
  processing:
    'Die Dateien werden nun verarbeitet. Danke fur deine Unterstuzung!',
} as const

type EpisodeFormProps = {
  missingEpisodes: { number: number; title: string }[]
}

export default function EpisodeForm({ missingEpisodes }: EpisodeFormProps) {
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

  const [mode, setMode] = React.useState<keyof typeof MODES>('episode')
  const [episode, setEpisode] = React.useState<string | undefined>(undefined)
  const [audioFiles, setFiles] = React.useState<AudioFile[]>([])

  const currentPartRef = React.useRef<number>(0)

  const allFilesUploaded = React.useMemo(
    () =>
      audioFiles.every(
        (file) => file.status !== 'selecting' && file.status !== 'uploading',
      ),
    [audioFiles],
  )
  const episodeNumber = React.useMemo(() => Number(episode), [episode])

  const reset = () => {
    currentPartRef.current = 0
    setEpisode('')
    setMode('episode')
    setFiles([])
  }

  const selectEpisode = (episodeNumber: string) => {
    setMode('files')
    setEpisode(episodeNumber)
  }

  const updateFile = (newFile: AudioFile) => {
    setFiles((prevFiles) => {
      const idx = prevFiles.findIndex((file) => newFile.id === file.id)
      const newFiles = [...prevFiles]
      newFiles[idx] = newFile

      return newFiles
    })
  }

  const removeFile = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
    currentPartRef.current--
  }

  const { mutate: requestNewAudioFile, isPending: isGeneratingUploadUrl } =
    useMutation({
      mutationFn: async (props: { episodeNumber: number; part: number }) => {
        const uploadUrlResponse = await getUploadURL(
          props.episodeNumber,
          props.part,
        )

        if (!uploadUrlResponse.success) {
          throw new Error(uploadUrlResponse.message)
        }

        return uploadUrlResponse
      },

      onSuccess: (uploadUrlData, props) => {
        const { id, url } = uploadUrlData.data as { url: string; id: string }

        const newFile = {
          id,
          part: props.part,
          status: 'selecting',
          uploadUrl: url,
          file: null,
        } satisfies AudioFile

        currentPartRef.current = props.part

        setFiles((prevFiles) => [...prevFiles, newFile])
      },

      onError: (error) => {
        console.error('An error occurred:', error)
      },
    })

  const { mutate: uploadFile } = useMutation({
    mutationFn: async (audioFile: AudioFile) => {
      updateFile({ ...audioFile, status: 'uploading' })

      const uploadResponse = await fetch(audioFile.uploadUrl, {
        method: 'PUT',
        body: audioFile.file,
        headers: {
          'Content-Type': (audioFile.file as File).type,
        },
      })

      if (!uploadResponse.ok) throw new Error('Could not upload file.')

      return null
    },
    onSuccess: (_, audioFile) => {
      updateFile({ ...audioFile, status: 'uploaded' })
    },
    onError: (_, audioFile) => {
      updateFile({ ...audioFile, status: 'canceled' })

      currentPartRef.current -= 1
    },
  })

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
          disabled={mode !== 'episode'}
          value={episode}
          onValueChange={selectEpisode}
        >
          Folge auswahlen
        </Select>

        <Button
          disabled={
            mode !== 'files' || isGeneratingUploadUrl || !allFilesUploaded
          }
          mode="outlined"
          loading={isGeneratingUploadUrl}
          onClick={() => {
            requestNewAudioFile({
              episodeNumber,
              part: currentPartRef.current + 1,
            })
          }}
        >
          Audiodatei hinzufugen
        </Button>

        <Button
          disabled={
            mode !== 'files' ||
            isGeneratingUploadUrl ||
            !allFilesUploaded ||
            audioFiles.length === 0
          }
        >
          Horspiel analysieren
        </Button>

        <Button
          disabled={mode !== 'files' || isGeneratingUploadUrl}
          onClick={reset}
          mode="destructive"
        >
          Auswahl aufheben
        </Button>
      </div>

      <p>{MODES[mode]}</p>

      <ol className="w-full space-y-2">
        {audioFiles.map((audioFile) => {
          const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.item(0)
            if (!file) return

            uploadFile({
              ...audioFile,
              file,
            })
          }

          return (
            <li className="flex gap-4 w-full" key={audioFile.part}>
              <FileItem
                {...audioFile}
                onChange={onChange}
                onRemove={removeFile}
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}
