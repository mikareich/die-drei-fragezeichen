import type { AudioFile } from './EpisodeForm'

type FileItemProps = AudioFile & {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onRemove?: (id: string) => void
}

export default function FileItem({
  id,
  status,
  part,
  onChange,
  onRemove,
  file,
}: FileItemProps) {
  return (
    <div className="flex gap-4 items-center w-full">
      <span className="uppercase text-gray-500">
        {String(part).padStart(3, '0')}. Teil
      </span>

      {status === 'selecting' ? (
        <label htmlFor={id} className="flex-1 block">
          <span className={`font-medium truncate underline cursor-pointer`}>
            Wahle eine Datei aus
          </span>
          <input
            type="file"
            hidden
            id={id}
            disabled={status !== 'selecting'}
            accept="audio/mpeg"
            size={104857600} // 100 MB
            onChange={onChange}
          />
        </label>
      ) : (
        <span className="font-medium truncate flex-1">{file?.name}</span>
      )}

      {status === 'uploading' && (
        <span className="text-yellow-500">Am hochladen...</span>
      )}

      {status === 'uploaded' && (
        <span className="text-green-500">Hochgeladen</span>
      )}

      {status === 'processing' && (
        <span className="text-yellow-500">Am verarbeiten...</span>
      )}

      {status === 'canceled' && (
        <span className="text-red-500">
          Datei konnte nicht hochgeladen werden...
        </span>
      )}

      {status === 'selecting' && (
        <button
          className="underline cursor-pointer"
          type="button"
          onClick={() => onRemove?.(id)}
        >
          Entfernen
        </button>
      )}
    </div>
  )
}
