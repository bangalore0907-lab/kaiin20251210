// 会員一覧画面のJavaScript

// ページ読み込み時に会員一覧を取得
document.addEventListener('DOMContentLoaded', () => {
  loadMembers()
})

// 会員一覧を取得して表示
async function loadMembers() {
  const listContainer = document.getElementById('member-list')
  
  try {
    const response = await fetch('/api/members')
    if (!response.ok) {
      throw new Error('Failed to fetch members')
    }
    
    const members = await response.json()
    
    if (members.length === 0) {
      listContainer.innerHTML = '<p class="loading">会員が登録されていません</p>'
      return
    }
    
    // テーブルを作成
    const table = document.createElement('table')
    table.innerHTML = `
      <thead>
        <tr>
          <th>会員No</th>
          <th>名前</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${members.map(member => `
          <tr>
            <td>${escapeHtml(member.member_no)}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>
              <a href="/edit/${member.id}" class="btn btn-edit">修正</a>
              <button class="btn btn-danger" onclick="deleteMember(${member.id})">削除</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `
    
    listContainer.innerHTML = ''
    listContainer.appendChild(table)
  } catch (error) {
    console.error('Error loading members:', error)
    listContainer.innerHTML = '<p class="message error">会員一覧の取得に失敗しました</p>'
  }
}

// 会員削除
async function deleteMember(id) {
  if (!confirm('この会員を削除してもよろしいですか?')) {
    return
  }
  
  try {
    const response = await fetch(`/api/members/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete member')
    }
    
    // 一覧を再読み込み
    loadMembers()
  } catch (error) {
    console.error('Error deleting member:', error)
    alert('削除に失敗しました')
  }
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
