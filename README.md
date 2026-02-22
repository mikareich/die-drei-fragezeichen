# Die Drei Fragezeichen -- Das Archiv

A comprehensive wiki of the Die Drei Fragezeichen universe (only main series). Ask an LLM about every processed episode backed by a exentsive RAG database. See detailed and interpreted informations about each episode as well as each contributor to the episodes.

## Infrastructure

- Website: Next.js App deployed to AWS via sst
- S3/Scripts: Chunked episode transcripts generated via transcript api
- S3/Audio: Normalized and chunked episode audios. Base of transcripts with gemini api.
- Lambda/Audio: Chunks and normalizes episode audios via ffmpeg. Stores audios in S3/Audio after raw processing and triggers transcription.
- API/Transcript: Transcibes audio from S3/Audio with gemini api, chunks it again and uploads product to S3/Scripts. Triggers vectorization.
- API/Vectorization: Generates vector per script part and stores it in dedicated vector db (e.g. pinecone?)

## Episode Ingestion Workflow

This workflow is designed to be executed on the official UI as well as for external services.

`status?: 'uploading' | 'transforming' | 'diarizing' | 'transcribing' | 'finalizing'`

1. **Create Ingestion Session** (exposed lambda `createIngestionSession`):
  - Parameters: `episodeNumber`, `sessionId` / `userId`
  - Return Values: `sessionId`?
  - Fetches episode metadata
  - Creates initial db entry in `ingestion_sessions` with `id`, `episodeId`, `episodeData`
  <!-- - Creates specific number of upload urls -->

2. **Generate upload url** (exposed lambda `generateUploadUrl`)
  - Parameters: `sessionId`, `part`
  - Returns: `fileId`, `uploadUrl`
  - Creates `raw_files` and `parts` entry
  - Generates upload url

2. **Upload File**:
  - Client makes POST request to upload url
  - Triggers "rest of ingestion pipeline"

2.5 **Update state**
  - 

-- REST OF INGESTION PIPELINE --

3. **Audio Transformation** (unexposed lambda `transformAudio`):
  - Triggered by s3 event
  - Parameters: `fileId`
  - Returns: n/a
  - Chunks and normalizes raw file with ffmpeg
  - Stores transformed files in dedicated bucket
  - Creates `processed_files` entries per chunk

4. **Transcript / Diarization**
  - 

4. **


## ER Diagram

```mermaid
---
title: DDF Assets
---
erDiagram
---
title: DDF Assets
---

erDiagram
    direction TB

    Asset {
        integer episode_number PK
        string cover_url
        uuid active_ingestion_id FK "Points to the currently live session"
    }

    IngestionSession {
        uuid id PK
        uuid userId FK
        integer episode_number FK
        string user_id
        datetime created_at
        string status "UPLOADING, PROCESSING, COMPLETED, FAILED"
        boolean is_archived "False if incomplete/failed, True if completed"
    }

    IngestionPart {
        uuid id PK
        uuid session_id FK
        integer part_index
    }

    EpisodeSegment {
        uuid id PK
        uuid part_id FK "Links back to origin session"
        string audio_s3_key "The normalized audio chunk"
        string transcript_s3_key "The text chunk"
    }

    Asset ||--o| IngestionSession : "active_ingestion_id"
    IngestionSession ||--|{ IngestionPart : "input"
    IngestionPart ||--|{ EpisodeSegment : "output""
```
