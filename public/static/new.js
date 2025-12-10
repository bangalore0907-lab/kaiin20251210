// 新規登録画面のJavaScript

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('member-form')
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const memberNo = document.getElementById('member_no').value.trim()
    const name = document.getElementById('name').value.trim()
    
    if (!memberNo || !name) {
      alert('すべての項目を入力してください')
      return
    }
    
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
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
        } else {
          throw new Error(error.error || 'Failed to create member')
        }
        return
      }
      
      // 成功したら一覧画面に戻る
      alert('会員を登録しました')
      window.location.href = '/'
    } catch (error) {
      console.error('Error creating member:', error)
      alert('登録に失敗しました')
    }
  })
})
