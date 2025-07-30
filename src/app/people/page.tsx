import Link from 'next/link'
import { getPeopleByQuery } from '~/actions/people'
import DataTable from '~/components/Table'
import { LOC_NA_CONTENT } from '~/utils/constants'
import { LIST_FORMAT } from '~/utils/format'

type PeoplePageProps = {
  searchParams: Promise<{ page: string; search: string }>
}

export default async function PeoplePage(params: PeoplePageProps) {
  const searchParams = await params.searchParams
  const urlSearch = searchParams.search || ''
  const urlPage = Number(searchParams.page) || 1

  const results = await getPeopleByQuery(urlSearch, urlPage)
  if (!results) throw new Error('Could not fetch people data :/')

  const { people, page, totalPages } = results

  const tableColumns = [
    { children: 'Name', size: 'auto' },
    { children: 'Rollen', size: 'full' },
    { children: 'Mitgewirkt', size: 'auto' },
    { children: <>&#x200e;</>, size: 'auto' },
  ] as const

  const tableContents = []

  for (const person of people) {
    tableContents.push([
      <span className="font-medium" key={`title/${person.id}`}>
        {person.name}
      </span>,
      LIST_FORMAT.format(person.roles) || LOC_NA_CONTENT,
      `${person.contributed}x`,
      <Link
        className="truncate text-gray-500 uppercase underline"
        href={`/people/${person.id}`}
        key={`link/${person.id}`}
        prefetch={true}
      >
        Zum Profil {'->'}
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
        queryPlaceholder="Suche nach deinem Lieblingssprecher"
        columns={tableColumns}
        currentPage={page}
        data={tableContents}
        search={urlSearch}
        totalPages={totalPages}
      />
    </main>
  )
}
