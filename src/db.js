import pg from 'pg'

const { Pool } = pg

// 環境変数の確認（デバッグ用）
console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('🔍 NODE_ENV:', process.env.NODE_ENV)

// DATABASE_URLが設定されていない場合のエラー
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  throw new Error('DATABASE_URL environment variable is required')
}

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// データベース接続テスト
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err)
})

// 初回接続テスト
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Initial connection test failed:', err.message)
  } else {
    console.log('✅ Initial connection test successful:', res.rows[0])
  }
})

export default pool
