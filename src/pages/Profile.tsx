import React, { useEffect, useState } from 'react'

type User = { nickname: string; email: string; password: string; role?: string; avatar?: string; bio?: string; likes?: number; dislikes?: number }

const Profile: React.FC<{ id: string }> = ({ id }) => {
  const [user, setUser] = useState<User | null>(null)
  const [sessionsCount, setSessionsCount] = useState(0)
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)

  useEffect(() => {
    // load user from global store
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = (typeof window !== 'undefined' && window.__USERS__) || {}
    const u = users[id] || null
    setUser(u)
    setLikes(u?.likes || 0)
    setDislikes(u?.dislikes || 0)

    // count sessions where this user appears (match by nickname or profileUrl)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const sessions = (typeof window !== 'undefined' && window.__SESSIONS__) || {}
    const arr = Object.values(sessions)
    const count = arr.filter((s: any) => (s.participants || []).some((p: any) => p.id === id || p.name === u?.nickname || (u?.avatar && p.profileUrl && p.profileUrl.includes(u.nickname)))).length
    setSessionsCount(count)
  }, [id])

  const currentRaw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
  const currentNick = currentRaw ? JSON.parse(currentRaw).nickname : null

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Профиль не найден</h2>
        <p>Пользователь не найден в системе.</p>
        <p><a href="#/">Вернуться на главную</a></p>
      </div>
    )
  }

  const vote = (type: 'like' | 'dislike') => {
    if (currentNick === user.nickname) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = (typeof window !== 'undefined' && window.__USERS__) || {}
    const key = Object.keys(users).find(k => users[k].nickname === user.nickname)
    if (!key) return
    if (type === 'like') {
      users[key].likes = (users[key].likes || 0) + 1
      setLikes(users[key].likes)
    } else {
      users[key].dislikes = (users[key].dislikes || 0) + 1
      setDislikes(users[key].dislikes)
    }
    // persist
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__USERS__ = users
  }

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover' }} /> : <div style={{ width: 120, height: 120, borderRadius: 12, background: '#e2e8f0' }} />}
        <div>
          <h1 style={{ margin: 0 }}>{user.nickname}</h1>
          <div style={{ color: '#64748b', marginTop: 8 }}>{user.bio}</div>
          <div style={{ marginTop: 8 }}>Активных игр: {sessionsCount}</div>
          <div style={{ marginTop: 8 }}>Рейтинг: <strong>{likes}</strong> 👍 / <strong>{dislikes}</strong> 👎</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {currentNick !== user.nickname ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => vote('like')}>Поставить +</button>
            <button onClick={() => vote('dislike')}>Поставить -</button>
          </div>
        ) : (
          <div style={{ color: '#64748b' }}>Это ваш профиль — поставить оценку нельзя.</div>
        )}
      </div>

      <p style={{ marginTop: 24 }}><a href="#/">← Вернуться</a></p>
    </div>
  )
}

export default Profile
