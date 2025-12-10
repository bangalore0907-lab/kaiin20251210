import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// データベース接続テスト
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err)
})

export default pool
