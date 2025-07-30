# Die Drei Fragezeichen -- Das Archiv

A comprehensive wiki of the Die Drei Fragezeichen universe (only main series). Ask an LLM about every processed episode backed by a exentsive RAG database. See detailed and interpreted informations about each episode as well as each contributor to the episodes.

## Infrastructure

- Website: Next.js App deployed to AWS via sst
- S3/Scripts: Chunked episode transcripts generated via transcript api
- S3/Audio: Normalized and chunked episode audios. Base of transcripts with gemini api.
- Lambda/Audio: Chunks and normalizes episode audios via ffmpeg. Stores audios in S3/Audio after raw processing and triggers transcription.
- API/Transcript: Transcibes audio from S3/Audio with gemini api, chunks it again and uploads product to S3/Scripts. Triggers vectorization.
- API/Vectorization: Generates vector per script part and stores it in dedicated vector db (e.g. pinecone?)
