import React, { useEffect, useState, useRef } from 'react'
import { Camera, Save, User as UserIcon, Trash2, CheckCircle } from 'lucide-react'

const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')

type UserProfile = {
  id: number
  userName: string
  email: string
  bio?: string
  avatarUrl?: string
  firstName?: string
  lastName?: string
  role: number
  password?: string
  isActive?: boolean
}

const roleBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '9px 12px', borderRadius: '8px',
  border: active ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.08)',
  background: active ? 'rgba(16,185,129,0.08)' : 'transparent',
  color: active ? '#10b981' : '#475569', fontSize: '13px',
  fontWeight: active ? 500 : 400, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '6px', transition: 'all 0.15s', fontFamily: 'inherit',
})

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0b1220', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '96px', paddingBottom: '48px', paddingLeft: '16px', paddingRight: '16px' },
  card: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '720px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' },
  sidebar: { width: '180px', minWidth: '180px', background: '#0b1220', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  avatarWrap: { width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(16,185,129,0.3)', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  camBtn: { position: 'absolute', bottom: '2px', right: '2px', width: '26px', height: '26px', borderRadius: '50%', background: '#10b981', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 },
  nickLabel: { fontSize: '14px', fontWeight: 500, color: '#e6eef8', textAlign: 'center' },
  deleteBtn: { background: 'none', border: 'none', padding: '4px 0', fontSize: '12px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s' },
  form: { flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: { background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#e6eef8', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' },
  inputReadonly: { background: '#080f1a', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#334155', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' },
  textarea: { background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#e6eef8', outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: '1.6', transition: 'border-color 0.15s' },
  roles: { display: 'flex', gap: '10px' },
  actions: { display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' },
  logoutBtn: { flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
}

const Account: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [nick, setNick] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    const id = getCurrentUserId()
    if (!id) { setLoading(false); return }

    fetch(`${BASE_URL}/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(r => r.json())
      .then((data: UserProfile) => {
        setUser(data)
        setNick(data.userName || '')
        setEmail(data.email || '')
        setBio(data.bio || '')
        setAvatar(data.avatarUrl || '')
        setFirstName(data.firstName || '')
        setLastName(data.lastName || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
  if (!user) return
  const body: Record<string, any> = {}

  if (nick) body.userName = nick
  if (email) body.email = email
  if (bio) body.bio = bio
  if (avatar !== undefined) body.avatarUrl = avatar
  if (firstName) body.firstName = firstName
  if (lastName) body.lastName = lastName
  if (newPassword) body.password = newPassword

  try {
    const res = await fetch(`${BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setStatus('Сохранено!')
      setTimeout(() => setStatus(null), 2000)
      try { window.dispatchEvent(new Event('authChange')) } catch {}
    } else {
      setStatus('Ошибка сохранения')
      setTimeout(() => setStatus(null), 2000)
    }
  } catch {
    setStatus('Ошибка соединения')
    setTimeout(() => setStatus(null), 2000)
  }
}

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('currentUser')
    window.location.hash = '#/'
    window.location.reload()
  }

  if (loading) return (
    <div style={s.page}>
      <div style={{ color: '#475569', paddingTop: '48px' }}>Загрузка...</div>
    </div>
  )

  if (!user) return (
    <div style={s.page}>
      <div style={{ color: '#475569', paddingTop: '48px' }}>
        Войдите в аккаунт. <a href="#/login" style={{ color: '#10b981' }}>Войти</a>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={{ position: 'relative', width: '88px', height: '88px' }}>
            <div style={s.avatarWrap}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserIcon size={32} color="#334155" />}
            </div>
            <button style={s.camBtn} onClick={() => fileRef.current?.click()}>
              <Camera size={13} color="white" />
            </button>
          </div>

          <span style={s.nickLabel}>{nick}</span>
          <span style={{ fontSize: '11px', color: '#334155' }}>
            {user.role === 2 ? 'GameMaster' : user.role === 3 ? 'Moderator' : user.role === 4 ? 'Admin' : 'Player'}
          </span>

          <button style={s.deleteBtn} onClick={() => setAvatar('')}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
            <Trash2 size={12} /> Удалить фото
          </button>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]; if (!f) return
            const r = new FileReader()
            r.onload = () => setAvatar(r.result as string)
            r.readAsDataURL(f)
          }} />
        </div>
          
        {/* Form */}
        <div style={s.form}>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Старый пароль</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                style={s.input} placeholder="••••••"
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Новый пароль</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={s.input} placeholder="••••••"
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Никнейм</label>
              <input value={nick} onChange={e => setNick(e.target.value)} style={s.input}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input value={email} readOnly style={s.inputReadonly} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>URL аватара</label>
            <input value={avatar} onChange={e => setAvatar(e.target.value)} style={s.input}
              placeholder="https://..."
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          <div style={s.field}>
            <label style={s.label}>О себе</label>
            
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Расскажите о себе..." style={s.textarea}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>


          <div style={s.actions}>
            <button style={{ flex: 2, padding: '10px 16px', borderRadius: '8px', border: status ? '1px solid rgba(16,185,129,0.4)' : 'none', background: status ? 'rgba(16,185,129,0.1)' : 'linear-gradient(180deg,#10b981,#059669)', color: status ? '#10b981' : 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
              onClick={save}>
              {status ? <CheckCircle size={15} /> : <Save size={15} />}
              {status || 'Сохранить'}
            </button>
            <button style={s.logoutBtn} onClick={logout}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account