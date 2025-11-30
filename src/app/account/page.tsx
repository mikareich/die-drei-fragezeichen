import Link from 'next/link'
import IngestionForm from './_components/IngestionForm'
import { getDatasetVersions, getMissingEpisodes } from './actions'

const EXAMPLE_SESSION_ID = '5e7b7377-f2d6-4ed2-af56-9e69f3e8641d'

export default async function AccountPage() {
  const { localVersion, newestVersion } = await getDatasetVersions()
  const missingEpisodes = await getMissingEpisodes()

  return (
    <main className="space-y-10">
      <h3 className="text-lg">
        Hier kannst du dein Profil verwalten und die Einstellungen der App nach
        deinen Wünschen anpassen. Aktualisiere persönliche Informationen, ändere
        dein Passwort oder passe Benachrichtigungen an. Deine Daten sind sicher
        und werden vertraulich behandelt. Viel Spaß beim Erkunden und
        Personalisieren deines Archivs!
      </h3>
      <section className="space-y-2">
        <h4 className="uppercase font-medium text-lg text-gray-500">
          Metadaten Datenbank
        </h4>

        <p>
          Die Metadaten aller Folgen basieren auf der Datenbank von{' '}
          <Link
            className="truncate text-gray-500 uppercase underline"
            href="https://dreimetadaten.de"
          >
            dreimetadaten.de
          </Link>
          . Wir nutzen die Version{' '}
          <span className="underline">{localVersion}</span>, die neuste Version
          ist <span className="underline">{newestVersion}</span>.
        </p>
      </section>

      <IngestionForm
        sessionId={EXAMPLE_SESSION_ID}
        missingEpisodes={missingEpisodes}
      />
    </main>
  )
}
