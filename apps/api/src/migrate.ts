import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const DATABASE_PATH = process.env.DATABASE_PATH ?? './data/life-map.db'

mkdirSync(dirname(DATABASE_PATH), { recursive: true })

const sqlite = new Database(DATABASE_PATH)
sqlite.pragma('journal_mode = WAL')

const db = drizzle(sqlite)

migrate(db, { migrationsFolder: './drizzle' })

console.log('[MIGRATE] Migrations applied successfully')
sqlite.close()
