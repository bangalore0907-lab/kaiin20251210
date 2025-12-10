// 修正画面のJavaScript

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('member-form')
  const memberId = form.dataset.memberId
  
  // 会員情報を取得して表示
  loadMember(memberId)
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const memberNo = document.getElementById('member_no').value.trim()
    const name = document.getElementById('name').value.trim()
    
    if (!memberNo || !name) {
      alert('すべての項目を入力してください')
      return
    }
    
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member_no: memberNo,
          name: name
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          alert('この会員Noは既に使用されています')
        } else if (response.status === 404) {
          alert('会員が見つかりません')
        } else {
          throw new Error(error.error || 'Failed to update member')
        }
        return
      }
      
      // 成功したら一覧画面に戻る
      alert('会員情報を更新しました')
      window.location.href = '/'
    } catch (error) {
      console.error('Error updating member:', error)
      alert('更新に失敗しました')
    }
  })
})

// 会員情報を取得
async function loadMember(id) {
  try {
    const response = await fetch(`/api/members/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch member')
    }
    
    const member = await response.json()
    
    document.getElementById('member_no').value = member.member_no
    document.getElementById('name').value = member.name
  } catch (error) {
    console.error('Error loading member:', error)
    alert('会員情報の取得に失敗しました')
    window.location.href = '/'
  }
}
