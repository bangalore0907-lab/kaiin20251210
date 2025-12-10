import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function seed() {
  try {
    await client.connect()
    console.log('✅ PostgreSQL connected')

    // テストデータの挿入
    const testData = [
      ['M001', '山田太郎'],
      ['M002', '佐藤花子'],
      ['M003', '鈴木一郎']
    ]

    for (const [member_no, name] of testData) {
      try {
        await client.query(
          'INSERT INTO members (member_no, name) VALUES ($1, $2) ON CONFLICT (member_no) DO NOTHING',
          [member_no, name]
        )
        console.log(`✅ Inserted: ${member_no} - ${name}`)
      } catch (error) {
        console.log(`⚠️  Skipped (already exists): ${member_no} - ${name}`)
      }
    }

    console.log('🎉 Seed data inserted successfully')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()
