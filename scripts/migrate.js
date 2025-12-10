import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function migrate() {
  try {
    await client.connect()
    console.log('✅ PostgreSQL connected')

    // 会員テーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        member_no VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Table "members" created or already exists')

    // インデックス作成
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_members_member_no ON members(member_no)
    `)
    console.log('✅ Index "idx_members_member_no" created or already exists')

    console.log('🎉 Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
