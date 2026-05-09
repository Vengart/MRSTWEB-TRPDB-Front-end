import React, { useEffect, useState, useRef } from 'react'
import { Camera, ThumbsUp, ThumbsDown, ArrowLeft, Save, User as UserIcon } from 'lucide-react'

type User = { nickname: string; email: string; password: string; role?: string; avatar?: string; bio?: string; likedBy?: string[]; dislikedBy?: string[] }

const inp: React.CSSProperties = {
  background: '#0b1220',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#e6eef8',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const lbl: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '6px',
}

const focusGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'
}
const blurGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
}

const Profile: React.FC<{ id: string }> = ({ id }) => {
  const [user, setUser] = useState<User | null>(null)
  const [sessionsCount, setSessionsCount] = useState(0)
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [saved, setSaved] = useState(false)

  const currentRaw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
  const currentNick = currentRaw ? JSON.parse(currentRaw).nickname : null

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bioText, setBioText] = useState('')

  useEffect(() => {
    // @ts-ignore
    const users = (typeof window !== 'undefined' && window.__USERS__) || {}
    let u = users[id] || null
    try {
      const savedRaw = localStorage.getItem('currentUser')
      if (savedRaw && u) {
        const s = JSON.parse(savedRaw)
        if (s.nickname === u.nickname) {
          u = { ...u, ...s }
          // @ts-ignore
          if (window.__USERS__) window.__USERS__[id] = u
        }
      }
    } catch {}
    setUser(u)
    setLikes((u?.likedBy || []).length || 0)
    setDislikes((u?.dislikedBy || []).length || 0)
    // @ts-ignore
    const sessions = (typeof window !== 'undefined' && window.__SESSIONS__) || {}
    const count = Object.values(sessions).filter((s: any) =>
      (s.participants || []).some((p: any) => p.id === id || p.name === u?.nickname)
    ).length
    setSessionsCount(count)
  }, [id])

  useEffect(() => {
    setFirstName(user?.nickname || '')
    setUsername(user?.nickname || '')
    setBioText(user?.bio || '')
  }, [user])

  const isOwn = !!(currentNick && user && currentNick === user.nickname)
  const vote = (type: 'like' | 'dislike') => {
    if (!user || currentNick === user.nickname) return
    // @ts-ignore
    const users = (typeof window !== 'undefined' && window.__USERS__) || {}
    const key = Object.keys(users).find(k => users[k].nickname === user.nickname)
    if (!key) return
    users[key].likedBy = users[key].likedBy || []
    users[key].dislikedBy = users[key].dislikedBy || []
    const liked = users[key].likedBy.includes(currentNick)
    const disliked = users[key].dislikedBy.includes(currentNick)

    if (type === 'like') {
      if (liked) {
        // remove like (toggle)
        users[key].likedBy = users[key].likedBy.filter((n: string) => n !== currentNick)
      } else {
        // remove dislike if present, then add like
        if (disliked) users[key].dislikedBy = users[key].dislikedBy.filter((n: string) => n !== currentNick)
        users[key].likedBy.push(currentNick)
      }
    } else {
      if (disliked) {
        users[key].dislikedBy = users[key].dislikedBy.filter((n: string) => n !== currentNick)
      } else {
        if (liked) users[key].likedBy = users[key].likedBy.filter((n: string) => n !== currentNick)
        users[key].dislikedBy.push(currentNick)
      }
    }

    // persist and update local counts
    // @ts-ignore
    window.__USERS__ = users
    setLikes((users[key].likedBy || []).length)
    setDislikes((users[key].dislikedBy || []).length)
  }

  const hasLiked = !!(currentNick && user && (user.likedBy || []).includes(currentNick))
  const hasDisliked = !!(currentNick && user && (user.dislikedBy || []).includes(currentNick))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      setUser(prev => prev ? { ...prev, avatar: data } : prev)
      // @ts-ignore
      const users = (typeof window !== 'undefined' && window.__USERS__) || {}
      const key = Object.keys(users).find(k => users[k].nickname === user?.nickname)
      if (key) {
        users[key].avatar = data
        // @ts-ignore
        window.__USERS__ = users
        if (currentNick && users[key].nickname === currentNick) {
          try { localStorage.setItem('currentUser', JSON.stringify(users[key])) } catch {}
        }
      }
    }
    reader.readAsDataURL(f)
  }

  const saveProfile = () => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, nickname: username, bio: bioText }
      // @ts-ignore
      const users = (typeof window !== 'undefined' && window.__USERS__) || {}
      const key = Object.keys(users).find(k => users[k].nickname === prev.nickname)
      if (key) {
        // preserve vote lists if present
        users[key] = { ...users[key], ...updated, likedBy: users[key].likedBy || [], dislikedBy: users[key].dislikedBy || [] }
        // @ts-ignore
        window.__USERS__ = users
        if (currentNick && users[key].nickname === currentNick) {
          try { localStorage.setItem('currentUser', JSON.stringify(users[key])) } catch {}
        }
      }
      return updated
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Общий layout-wrapper
  const PageWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '32px 16px',
    }}>
      {children}
    </div>
  )

  if (!user) return (
    <PageWrap>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '48px 32px', textAlign: 'center', maxWidth: '400px', width: '100%',
      }}>
        <h2 style={{ color: '#e6eef8', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Профиль не найден</h2>
        <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 20px' }}>Пользователь не найден в системе.</p>
        <a href="#/" style={{ color: '#10b981', fontSize: '13px', textDecoration: 'none' }}>← На главную</a>
      </div>
    </PageWrap>
  )

  // Общий сайдбар с аватаром
  const Sidebar = ({ editable }: { editable: boolean }) => (
    <div style={{
      width: '180px', minWidth: '180px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    }}>
      {/* Аватар */}
      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden',
          border: '2px solid rgba(16,185,129,0.3)', background: '#1e293b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {user.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <UserIcon size={36} color="#334155" />}
        </div>
        {editable && (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '26px', height: '26px', borderRadius: '50%',
              background: '#10b981', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Camera size={13} color="white" />
          </button>
        )}
      </div>

      <span style={{ fontSize: '15px', fontWeight: 700, color: '#e6eef8', textAlign: 'center' }}>
        {user.nickname}
      </span>

      {/* Статы */}
      <div style={{
        width: '100%', background: '#0b1220', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
          <span>Активных игр</span>
          <span style={{ color: '#e6eef8', fontWeight: 600 }}>{sessionsCount}</span>
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThumbsUp size={11} color="#10b981" /> {likes}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThumbsDown size={11} color="#ef4444" /> {dislikes}
          </span>
        </div>
      </div>

      {editable && <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />}
    </div>
  )

  // Чужой профиль
  if (!isOwn) return (
    <PageWrap>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden', display: 'flex',
        width: '100%', maxWidth: '700px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Сайдбар */}
        <div style={{
          width: '200px', minWidth: '200px', background: '#0b1220',
          borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <Sidebar editable={false} />
        </div>

        {/* Контент */}
        <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Никнейм</label>
            <input readOnly value={user.nickname} style={{ ...inp, color: '#475569', cursor: 'default' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>О себе</label>
            <textarea readOnly value={user.bio || ''} rows={4} style={{ ...inp, resize: 'none', lineHeight: '1.6', color: '#475569', cursor: 'default' }} />
          </div>

          {/* Кнопки голосования */}
          <div style={{
            display: 'flex', gap: '10px', paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto',
          }}>
            <button
              onClick={() => vote('like')}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                border: hasLiked ? '1px solid rgba(16,185,129,0.75)' : '1px solid rgba(16,185,129,0.25)',
                background: hasLiked ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.08)',
                color: '#10b981', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)' }}
            >
              <ThumbsUp size={14} /> Лайк
            </button>
            <button
              onClick={() => vote('dislike')}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                border: hasDisliked ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(239,68,68,0.2)',
                background: hasDisliked ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)',
                color: '#ef4444', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
            >
              <ThumbsDown size={14} /> Дизлайк
            </button>
            <a href="#/" style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e6eef8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <ArrowLeft size={14} /> Назад
            </a>
          </div>
        </div>
      </div>
    </PageWrap>
  )

  // Свой профиль
  return (
    <PageWrap>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden', display: 'flex',
        width: '100%', maxWidth: '700px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Сайдбар */}
        <div style={{
          width: '200px', minWidth: '200px', background: '#0b1220',
          borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <Sidebar editable={true} />
        </div>

        {/* Форма */}
        <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Имя</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inp} onFocus={focusGreen} onBlur={blurGreen} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Фамилия</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} style={inp} onFocus={focusGreen} onBlur={blurGreen} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Имя пользователя</label>
            <input value={username} onChange={e => setUsername(e.target.value)} style={inp} onFocus={focusGreen} onBlur={blurGreen} />
            <span style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
              orichalcum.app/{username || 'username'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>О себе</label>
            <textarea
              value={bioText} onChange={e => setBioText(e.target.value)} rows={4}
              style={{ ...inp, resize: 'none', lineHeight: '1.6' }}
              onFocus={focusGreen} onBlur={blurGreen}
            />
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex', gap: '10px', paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto',
          }}>
            <button
              onClick={saveProfile}
              style={{
                flex: 2, padding: '10px 16px', borderRadius: '8px', border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none',
                background: saved ? 'rgba(16,185,129,0.1)' : 'linear-gradient(180deg,#10b981,#059669)',
                color: saved ? '#10b981' : 'white', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s',
              }}
            >
              <Save size={15} /> {saved ? 'Сохранено!' : 'Сохранить'}
            </button>
            <button
              onClick={() => { setFirstName(user?.nickname || ''); setLastName(''); setUsername(user?.nickname || ''); setBioText(user?.bio || '') }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                color: '#475569', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e6eef8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              Сбросить
            </button>
            <a href="#/" style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 14px',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e6eef8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <ArrowLeft size={14} />
            </a>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

export default Profile