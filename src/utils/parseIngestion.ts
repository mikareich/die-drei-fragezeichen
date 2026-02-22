import type {
  ingestionParts,
  ingestionSessions,
  processedAudioFiles,
} from '~/db/schema'
import type { IngestionSession, Nullable } from './types'

type RawIngestionSession = {
  ingestionSessions: typeof ingestionSessions.$inferSelect
  ingestionParts: Nullable<typeof ingestionParts.$inferSelect> | null
  processedAudioFiles: Nullable<typeof processedAudioFiles.$inferSelect> | null
}

export function parseIngestionSessions(
  rawIngestionSessions: RawIngestionSession[],
): IngestionSession[] {
  const ingestionSessions: IngestionSession[] = []
  console.log(rawIngestionSessions)

  let ingestionSessionResults: RawIngestionSession[] = []
  for (let idx = 0; idx < rawIngestionSessions.length; idx += 1) {
    const current = rawIngestionSessions[idx]
    const next = rawIngestionSessions[idx + 1]

    ingestionSessionResults.push(current)

    if (current.ingestionSessions.id !== next?.ingestionSessions?.id) {
      const ingestionSession = parseIngestionSession(ingestionSessionResults)
      if (ingestionSession) ingestionSessions.push(ingestionSession)

      ingestionSessionResults = []
    }
  }

  return ingestionSessions
}

function parseIngestionSession(
  rawIngestionSession: RawIngestionSession[],
): IngestionSession {
  const { ingestionSessions } = rawIngestionSession[0]
  const parts: IngestionSession['parts'] = []

  for (const column of rawIngestionSession) {
    const audioFile = column.processedAudioFiles
    const part = column.ingestionParts

    if (part) {
      const idx = parts.findIndex((p) => p.id === part.id)

      if (idx === -1) {
        // First time seeing this part, add it
        parts.push({
          ...(part as typeof ingestionParts.$inferSelect),
          processedAudioFiles: audioFile
            ? [audioFile as typeof processedAudioFiles.$inferSelect]
            : [],
        })
      } else if (audioFile) {
        // Part exists, add the audio file to the array
        if (!parts[idx].processedAudioFiles) {
          parts[idx].processedAudioFiles = []
        }
        parts[idx].processedAudioFiles.push(
          audioFile as typeof processedAudioFiles.$inferSelect,
        )
      }
    }
  }

  return { ...ingestionSessions, parts }
}
