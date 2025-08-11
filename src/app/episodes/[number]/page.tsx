import { notFound } from 'next/navigation'
import React from 'react'
import { getEpisodeByNumber } from '~/actions/episode'
import Label from '~/components/Label'
import { db } from '~/db/db'
import { views } from '~/db/views'
import Cast from './_components/Cast'
import Header from './_components/Header'
import Script from './_components/Script'
import Tracks from './_components/Tracks'

type EpisodePageProps = {
  params: Promise<{ number: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const numbers = await db
    .selectDistinct({ number: views.episodeView.number })
    .from(views.episodeView)

  return numbers.map(({ number }) => ({ number: String(number || 1) }))
}

export default async function EpisodePage(props: EpisodePageProps) {
  const params = await props.params
  const number = Number(params.number)

  const episode = await getEpisodeByNumber(number)
  if (!episode) notFound()

  return (
    <main className="space-y-6">
      <Header episode={episode} />

      <Label className="text-wrap" description="Beschreibung">
        {episode.description}
      </Label>

      <Cast episode={episode} />

      <Tracks episode={episode} />

      <React.Suspense
        fallback={
          <Label className="text-wrap" description="Skript">
            Skript wird geladen...
          </Label>
        }
      >
        <Script episode={episode} page={1} />
      </React.Suspense>
    </main>
  )
}
