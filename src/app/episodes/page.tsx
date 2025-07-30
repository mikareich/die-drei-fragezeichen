import Link from 'next/link'
import { getEpisodesByQuery } from '~/actions/episode'
import DataTable from '~/components/Table'

type EpisodesPageParams = {
  searchParams: Promise<{ page: string; search: string }>
}

export default async function EpsiodesPage(params: EpisodesPageParams) {
  const searchParams = await params.searchParams
  const urlSearch = searchParams.search || ''
  const urlPage = Number(searchParams.page) || 1

  const episodesData = await getEpisodesByQuery(urlSearch, urlPage)
  if (!episodesData) throw new Error('Could not fetch the episodes :/')

  const { episodes, page, totalPages } = episodesData

  const tableColumns = [
    { children: 'Nummer', size: 'auto' },
    { children: 'Die Drei ???', size: 'auto' },
    { children: 'Beschreibung', size: 'full' },
    { children: '‎', size: 'auto' },
  ] as const

  const tableContents = []
  for (const episode of episodes) {
    tableContents.push([
      episode.formattedID,
      <span className="font-medium" key={`title/${episode.id}`}>
        {episode.title}
      </span>,
      episode.description,
      <Link
        className="truncate text-gray-500 uppercase underline"
        href={`/episodes/${episode.formattedID}`}
        key={`link/${episode.number}`}
        prefetch={true}
      >
        Zur Folge {'->'}
      </Link>,
    ])
  }

  return (
    <main className="space-y-10">
      <h3 className="text-lg">
        Willkommen im ???-Archiv. Hier findest du alle Folgen der drei Detektive
        auf einen Blick – übersichtlich, durchsuchbar und sortiert. Egal ob du
        alte Klassiker wiederentdecken oder aktuelle Fälle nachholen willst,
        hier wirst du fündig.
      </h3>

      <DataTable
        queryPlaceholder="Suche nach deiner Lieblingsfolge"
        columns={tableColumns}
        currentPage={page}
        data={tableContents}
        search={urlSearch}
        totalPages={totalPages}
      />
    </main>
  )
}
