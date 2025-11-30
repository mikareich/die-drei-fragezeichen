import { TrashIcon } from '@radix-ui/react-icons'
import type React from 'react'
import Button from '~/components/Button'
import { MAX_UPLOAD_SIZE } from '~/utils/constants'
import type { IngestionSession } from '~/utils/types'
import type { IngestionSessionMutations } from './IngestionForm'

type IngestionPartsProps = {
  ingestionSession: IngestionSession | null
  isUpdatingSession: boolean
  updateSession: (variables: IngestionSessionMutations) => void
}

export default function IngestionParts({
  ingestionSession,
  isUpdatingSession,
  updateSession,
}: IngestionPartsProps) {
  return (
    <ol className="w-full space-y-2 ">
      {ingestionSession?.parts?.map((part) => {
        const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const fileData = event.target.files?.item(0)
          if (!fileData) return

          updateSession({
            type: 'uploadFile',
            payload: {
              file: fileData,
              uploadUrl: part.file?.uploadUrl || '',
              fileId: part.file?.id || '',
            },
          })
        }

        console.log(part)

        return (
          <li
            className="flex gap-4 items-center w-full"
            key={`ingestionPart/${part.id}`}
          >
            <span className="uppercase text-gray-500">
              {String(part.index).padStart(3, '0')}. Teil
            </span>

            {part.status === 'pending' ||
            (part.status === 'deleting' && !part.file?.fileName) ? (
              <label htmlFor={part.id} className="flex-1 block">
                <span className="font-medium truncate underline cursor-pointer">
                  Wahle eine Datei aus
                </span>

                <input
                  type="file"
                  hidden
                  disabled={isUpdatingSession}
                  id={part.id}
                  accept="audio/mpeg"
                  size={MAX_UPLOAD_SIZE} // 100 MB
                  onChange={onChange}
                />
              </label>
            ) : (
              <span className="font-medium truncate flex-1">
                {part.file?.fileName || 'No file'}
              </span>
            )}

            {part.status === 'uploading' && (
              <span className="text-gray-500">Am hochladen...</span>
            )}

            {part.status === 'processing' && (
              <span className="text-gray-500">Am verarbeiten...</span>
            )}

            {part.status === 'deleting' && (
              <span className="text-gray-500">Am entfernen...</span>
            )}

            <Button
              type="button"
              mode="destructive"
              title="Remove part"
              aria-description="Remove part"
              prefixIcon={<TrashIcon className="size-4" />}
              disabled={isUpdatingSession}
              onClick={() =>
                updateSession({
                  type: 'removePart',
                  payload: { partId: part.id },
                })
              }
            />
          </li>
        )
      })}
    </ol>
  )
}
