import { notFound } from 'next/navigation'
import React from 'react'
import { getEpisodeByNumber } from '~/actions/episode'
import Label from '~/components/Label'
import Cast from './_components/Cast'
import Header from './_components/Header'
import Script from './_components/Script'
import Tracks from './_components/Tracks'

type EpisodePageProps = {
  params: Promise<{ number: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function EpisodePage(props: EpisodePageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  const number = Number(params.number)
  const episode = await getEpisodeByNumber(number)

  console.log(episode?.cast, typeof episode?.cast, new Map(episode?.cast || []))

  const page = Number(searchParams.page) || 1

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
        <Script episode={episode} page={page} />
      </React.Suspense>
    </main>
  )
}
