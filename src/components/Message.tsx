import { formatRelativeDate } from '~/utils/format'

type MessageProps = {
  content: string
  author: 'system' | 'user'
  timestamp: Date
}

export default function Message({ content, author, timestamp }: MessageProps) {
  return (
    <div className={author === 'system' ? 'float-left' : 'float-right'}>
      <p
        className={`max-w-81 p-2 ${author === 'system' ? 'bg-gray-100' : 'bg-gray-300'}`}
      >
        {content}
      </p>

      <span
        className={`text-gray-500 text-sm uppercase ${author === 'system' ? 'float-left ml-2' : 'float-right mr-2'}`}
      >
        {author}, {formatRelativeDate(timestamp)}
      </span>
    </div>
  )
}
