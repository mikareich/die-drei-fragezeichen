import Link from 'next/link'
import React from 'react'
import EpisodeForm from './_components/EpisodeForm'
import { getDatasetVersions, getMissingEpisodes } from './actions'

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

      <EpisodeForm missingEpisodes={missingEpisodes} />
    </main>
  )
}
