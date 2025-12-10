import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())

// レンダラー設定
app.use(renderer)

// ============================================
// API Routes
// ============================================

// 会員一覧取得
app.get('/api/members', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM members ORDER BY member_no ASC'
    ).all()
    return c.json(results)
  } catch (error) {
    console.error('Error fetching members:', error)
    return c.json({ error: 'Failed to fetch members' }, 500)
  }
})

// 会員詳細取得
app.get('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM members WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ error: 'Member not found' }, 404)
    }
    
    return c.json(results[0])
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
    
    const result = await c.env.DB.prepare(
      'INSERT INTO members (member_no, name) VALUES (?, ?)'
    ).bind(member_no, name).run()
    
    return c.json({ 
      id: result.meta.last_row_id,
      member_no,
      name
    }, 201)
  } catch (error: any) {
    console.error('Error creating member:', error)
    if (error.message && error.message.includes('UNIQUE')) {
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
    
    const result = await c.env.DB.prepare(
      'UPDATE members SET member_no = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(member_no, name, id).run()
    
    if (result.meta.changes === 0) {
      return c.json({ error: 'Member not found' }, 404)
    }
    
    return c.json({ id, member_no, name })
  } catch (error: any) {
    console.error('Error updating member:', error)
    if (error.message && error.message.includes('UNIQUE')) {
      return c.json({ error: 'Member number already exists' }, 409)
    }
    return c.json({ error: 'Failed to update member' }, 500)
  }
})

// 会員削除
app.delete('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await c.env.DB.prepare(
      'DELETE FROM members WHERE id = ?'
    ).bind(id).run()
    
    if (result.meta.changes === 0) {
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
  return c.render(
    <div>
      <h1>会員管理システム</h1>
      <div class="actions">
        <a href="/new" class="btn btn-primary">新規登録</a>
      </div>
      <div id="member-list">
        <p>読み込み中...</p>
      </div>
      <script src="/static/app.js"></script>
    </div>
  )
})

// 新規登録画面
app.get('/new', (c) => {
  return c.render(
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
      <script src="/static/new.js"></script>
    </div>
  )
})

// 修正画面
app.get('/edit/:id', (c) => {
  const id = c.req.param('id')
  return c.render(
    <div>
      <h1>会員情報修正</h1>
      <form id="member-form" data-member-id={id}>
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
      <script src="/static/edit.js"></script>
    </div>
  )
})

export default app
