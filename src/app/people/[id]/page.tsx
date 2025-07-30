import { notFound } from 'next/navigation'
import { getPerson } from '~/actions/people'
import BooksAuthored from './_components/EpisodesAuthored'
import EpisodesCasted from './_components/EpisodesCasted'
import ScriptsAuthored from './_components/EpisodesScripted'
import Header from './_components/Header'

type DetailedProfilePageProps = {
  params: Promise<{ id?: string }>
}

export default async function DetailedProfilePage(
  props: DetailedProfilePageProps,
) {
  const params = await props.params
  const id = Number(params.id)

  const person = await getPerson(id)
  if (!person) notFound()

  return (
    <main className="space-y-6">
      <Header person={person} />

      <EpisodesCasted person={person} />

      <BooksAuthored person={person} />

      <ScriptsAuthored person={person} />
    </main>
  )
}
