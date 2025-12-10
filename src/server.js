import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pool from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// API Routes
// ============================================

// 会員一覧取得
app.get('/api/members', async (c) => {
  try {
    const result = await pool.query(
      'SELECT * FROM members ORDER BY member_no ASC'
    )
    return c.json(result.rows)
  } catch (error) {
    console.error('Error fetching members:', error)
    return c.json({ error: 'Failed to fetch members' }, 500)
  }
})

// 会員詳細取得
app.get('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Member not found' }, 404)
    }
    
    return c.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching member:', error)
    return c.json({ error: 'Failed to fetch member' }, 500)
  }
})

// 会員新規作成
app.post('/api/members', async (c) => {
  try {
    const { member_no, name } = await c.req.json()
    
    if (!member_no || !name) {
      return c.json({ error: 'member_no and name are required' }, 400)
    }
    
    const result = await pool.query(
      'INSERT INTO members (member_no, name) VALUES ($1, $2) RETURNING *',
      [member_no, name]
    )
    
    return c.json(result.rows[0], 201)
  } catch (error) {
    console.error('Error creating member:', error)
    if (error.code === '23505') { // unique_violation
      return c.json({ error: 'Member number already exists' }, 409)
    }
    return c.json({ error: 'Failed to create member' }, 500)
  }
})

// 会員更新
app.put('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { member_no, name } = await c.req.json()
    
    if (!member_no || !name) {
      return c.json({ error: 'member_no and name are required' }, 400)
    }
    
    const result = await pool.query(
      'UPDATE members SET member_no = $1, name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [member_no, name, id]
    )
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Member not found' }, 404)
    }
    
    return c.json(result.rows[0])
  } catch (error) {
    console.error('Error updating member:', error)
    if (error.code === '23505') { // unique_violation
      return c.json({ error: 'Member number already exists' }, 409)
    }
    return c.json({ error: 'Failed to update member' }, 500)
  }
})

// 会員削除
app.delete('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await pool.query(
      'DELETE FROM members WHERE id = $1 RETURNING *',
      [id]
    )
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Member not found' }, 404)
    }
    
    return c.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Error deleting member:', error)
    return c.json({ error: 'Failed to delete member' }, 500)
  }
})

// ============================================
// HTML Routes
// ============================================

// 会員一覧画面
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>会員管理システム</title>
      <link href="/static/style.css" rel="stylesheet" />
    </head>
    <body>
      <div>
        <h1>会員管理システム</h1>
        <div class="actions">
          <a href="/new" class="btn btn-primary">新規登録</a>
        </div>
        <div id="member-list">
          <p>読み込み中...</p>
        </div>
      </div>
      <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// 新規登録画面
app.get('/new', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>会員新規登録</title>
      <link href="/static/style.css" rel="stylesheet" />
    </head>
    <body>
      <div>
        <h1>会員新規登録</h1>
        <form id="member-form">
          <div class="form-group">
            <label for="member_no">会員No:</label>
            <input type="text" id="member_no" name="member_no" required />
          </div>
          <div class="form-group">
            <label for="name">名前:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">登録</button>
            <a href="/" class="btn btn-secondary">キャンセル</a>
          </div>
        </form>
      </div>
      <script src="/static/new.js"></script>
    </body>
    </html>
  `)
})

// 修正画面
app.get('/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>会員情報修正</title>
      <link href="/static/style.css" rel="stylesheet" />
    </head>
    <body>
      <div>
        <h1>会員情報修正</h1>
        <form id="member-form" data-member-id="${id}">
          <div class="form-group">
            <label for="member_no">会員No:</label>
            <input type="text" id="member_no" name="member_no" required />
          </div>
          <div class="form-group">
            <label for="name">名前:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">更新</button>
            <a href="/" class="btn btn-secondary">キャンセル</a>
          </div>
        </form>
      </div>
      <script src="/static/edit.js"></script>
    </body>
    </html>
  `)
})

const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
