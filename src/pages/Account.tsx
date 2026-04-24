import React, { useEffect, useState } from 'react'
import styles from './Login.module.css'

type User = { nickname: string; email: string; password: string; role?: string }

const loadCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem('currentUser')
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [nick, setNick] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const u = loadCurrentUser()
    if (u) {
      setUser(u)
      setNick(u.nickname)
      setEmail(u.email)
      setPassword(u.password)
      setAvatar((u as any).avatar || '')
      setBio((u as any).bio || '')
    }
  }, [])

  const save = () => {
    if (!user) return
    const updated = { ...user, nickname: nick, email, password, avatar: avatar || undefined, bio: bio || undefined }
    // update localStorage
    localStorage.setItem('currentUser', JSON.stringify(updated))
    // update window.__USERS__ if present
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__USERS__) {
      // find by old email or nickname
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const users = window.__USERS__
      const key = Object.keys(users).find(k => users[k].email === user.email || users[k].nickname === user.nickname)
      if (key) users[key] = { nickname: nick, email, password, role: users[key].role }
      if (key) users[key] = { nickname: nick, email, password, role: users[key].role, avatar: avatar || users[key].avatar, bio: bio || users[key].bio, likes: users[key].likes || 0, dislikes: users[key].dislikes || 0 }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__USERS__ = users
    }
    setStatus('Сохранено')
    setTimeout(() => setStatus(null), 1200)
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined') delete window.__CURRENT_USER__
    try { window.dispatchEvent(new Event('authChange')) } catch {}
    window.location.hash = '#/'
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Аккаунт</h2>
          <p>Пользователь не обнаружен. Пожалуйста, войдите.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Профиль</h2>
        <div className={styles.form}>
          <label className={styles.label}>
            Никнейм
            <div className={styles.inputWrap}>
              <input className={styles.input} value={nick} onChange={(e)=>setNick(e.target.value)} />
            </div>
          </label>

          <label className={styles.label}>
            Email
            <div className={styles.inputWrap}>
              <input className={styles.input} value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
          </label>

          <label className={styles.label}>
            URL аватара
            <div className={styles.inputWrap}>
              <input className={styles.input} value={avatar} onChange={(e)=>setAvatar(e.target.value)} />
            </div>
          </label>

          <label className={styles.label}>
            О себе
            <div className={styles.inputWrap}>
              <input className={styles.input} value={bio} onChange={(e)=>setBio(e.target.value)} />
            </div>
          </label>

          <label className={styles.label}>
            Пароль
            <div className={styles.inputWrap}>
              <input className={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>
          </label>

          <div className={styles.actions}>
            <button className={styles.primary} onClick={save}>Сохранить</button>
            <button className={styles.secondary} onClick={logout}>Выйти</button>
          </div>
          {status && <div className={styles.message} style={{ color:'#059669' }}>{status}</div>}
        </div>
      </div>
    </div>
  )
}

export default Account
