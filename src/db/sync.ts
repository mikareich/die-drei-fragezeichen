import { readFile } from 'node:fs/promises'
import { sql } from 'drizzle-orm'
import { db } from './db'
import { views } from './views'

async function dropProblematicViews() {
  try {
    await db.run(sql`DROP VIEW IF EXISTS alle`)
  } catch (error) {
    console.log('Failed to drop view alle:', error)
  }

  try {
    await db.run(sql`DROP VIEW IF EXISTS alleIDs`)
  } catch (error) {
    console.log('Failed to drop view alleIDs:', error)
  }
}

async function syncEpisodeView() {
  await db.delete(views.episodeView)

  const sql = await readFile(new URL('./syncEpisodes.sql', import.meta.url), {
    encoding: 'utf-8',
  })
  await db.run(sql)
}

async function syncPeopleView() {
  await db.delete(views.peopleView)

  const sql = await readFile(new URL('syncPeople.sql', import.meta.url), {
    encoding: 'utf-8',
  })
  await db.run(sql)
}

async function syncAllViews() {
  console.log('Syncing all materialized views...')

  await dropProblematicViews()
  await syncEpisodeView()
  await syncPeopleView()

  console.log('All materialized views synced successfully')
}

syncAllViews()
