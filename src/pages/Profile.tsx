import React, { useEffect, useState, useRef } from 'react'
import { Camera, ArrowLeft, Save, User as UserIcon } from 'lucide-react'

const BASE_URL = 'https://localhost:7214/api'

type UserProfile = {
  id: number
  userName: string
  email: string
  bio?: string
  avatarUrl?: string
  firstName?: string
  lastName?: string
  role: number
}

const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')

const inp: React.CSSProperties = {
  background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
  color: '#e6eef8', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
}
const lbl: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '6px',
}
const focusGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'
}
const blurGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
}

const Profile: React.FC<{ id: string }> = ({ id }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bioText, setBioText] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const currentUserId = getCurrentUserId()
  const isOwn = currentUserId === id

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
          }
        })
        if (!res.ok) { setError('Пользователь не найден'); setLoading(false); return }
        const data: UserProfile = await res.json()
        setUser(data)
        setFirstName(data.firstName || '')
        setLastName(data.lastName || '')
        setUsername(data.userName || '')
        setBioText(data.bio || '')
        setAvatarUrl(data.avatarUrl || '')
      } catch {
        setError('Ошибка соединения с сервером')
      }
      setLoading(false)
    }
    fetchUser()
  }, [id])

  const saveProfile = async () => {
    if (!user) return
    try {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          ...user,
          userName: username,
          bio: bioText,
          avatarUrl: avatarUrl,
          firstName: firstName,
          lastName: lastName,
        })
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setError('Ошибка сохранения')
    }
  }

  // Загрузка аватара как base64 → сохраняем в avatarUrl
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = () => { setAvatarUrl(reader.result as string) }
    reader.readAsDataURL(f)
  }

  const PageWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px' }}>
      {children}
    </div>
  )

  if (loading) return <PageWrap><div style={{ color: '#475569', paddingTop: '48px' }}>Загрузка...</div></PageWrap>

  if (error || !user) return (
    <PageWrap>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ color: '#e6eef8', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Профиль не найден</h2>
        <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 20px' }}>{error}</p>
        <a href="#/" style={{ color: '#10b981', fontSize: '13px', textDecoration: 'none' }}>← На главную</a>
      </div>
    </PageWrap>
  )

  const Sidebar = ({ editable }: { editable: boolean }) => (
    <div style={{ width: '180px', minWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
        <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(16,185,129,0.3)', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <UserIcon size={36} color="#334155" />}
        </div>
        {editable && (
          <button onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '2px', right: '2px', width: '26px', height: '26px', borderRadius: '50%', background: '#10b981', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={13} color="white" />
          </button>
        )}
      </div>
      <span style={{ fontSize: '15px', fontWeight: 700, color: '#e6eef8', textAlign: 'center' }}>{user.userName}</span>
      <div style={{ width: '100%', background: '#0b1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
          <span>Роль</span>
          <span style={{ color: '#e6eef8', fontWeight: 600 }}>
            {user.role === 2 ? 'GameMaster' : user.role === 3 ? 'Moderator' : user.role === 4 ? 'Admin' : 'Player'}
          </span>
        </div>
      </div>
      {editable && <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />}
    </div>
  )

  // Чужой профиль
  if (!isOwn) return (
    <PageWrap>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', width: '100%', maxWidth: '700px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ width: '200px', minWidth: '200px', background: '#0b1220', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Sidebar editable={false} />
        </div>
        <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Никнейм</label>
            <input readOnly value={user.userName} style={{ ...inp, color: '#475569', cursor: 'default' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>О себе</label>
            <textarea readOnly value={user.bio || ''} rows={4} style={{ ...inp, resize: 'none', lineHeight: '1.6', color: '#475569', cursor: 'default' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
            <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>
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
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', width: '100%', maxWidth: '700px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ width: '200px', minWidth: '200px', background: '#0b1220', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Sidebar editable={true} />
        </div>
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
            <span style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>orichalcum.app/{username || 'username'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>URL аватара</label>
            <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={inp} onFocus={focusGreen} onBlur={blurGreen} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>О себе</label>
            <textarea value={bioText} onChange={e => setBioText(e.target.value)} rows={4} style={{ ...inp, resize: 'none', lineHeight: '1.6' }} onFocus={focusGreen} onBlur={blurGreen} />
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
            <button onClick={saveProfile} style={{ flex: 2, padding: '10px 16px', borderRadius: '8px', border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none', background: saved ? 'rgba(16,185,129,0.1)' : 'linear-gradient(180deg,#10b981,#059669)', color: saved ? '#10b981' : 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={15} /> {saved ? 'Сохранено!' : 'Сохранить'}
            </button>
            <button onClick={() => { setFirstName(user.firstName || ''); setLastName(user.lastName || ''); setUsername(user.userName); setBioText(user.bio || ''); setAvatarUrl(user.avatarUrl || '') }} style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Сбросить
            </button>
            <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>
              <ArrowLeft size={14} />
            </a>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

export default Profile