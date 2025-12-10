import pg from 'pg'

const { Client } = pg

// 環境変数の確認
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  process.exit(1)
}

console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL)

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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
