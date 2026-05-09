import React, { useState, useEffect } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import styles from './Login.module.css'

type UserType = { nickname: string; email: string; password: string; role: 'user' | 'admin'; avatar?: string; bio?: string; likedBy?: string[]; dislikedBy?: string[] }

const SEED_USERS: Record<string, UserType> = {
  vengart: { nickname: 'vengart', email: 'vengartium@gmail.com', password: '123123', role: 'user', avatar: 'https://www.gaydamak.com.ua/image/cache/catalog/image/catalog/products/Patchi--Shevrony--Nashivki/Nashivka-patch-shevron-Pepe-s-sizhkoj.webp', bio: 'Игрок и мастер по Pathfinder и D&D.', likedBy: [], dislikedBy: [] },
  admin: { nickname: 'aR2Om', email: 'drunkcaydencai1ean@gmail.com', password: '123123', role: 'admin', avatar: 'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg', bio: 'Организатор сессий и координатор.', likedBy: [], dislikedBy: [] }
}

const Register: React.FC = () => {
  const [nick, setNick] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // seed global users for debug
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.__USERS__) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__USERS__ = SEED_USERS
    }
  }, [])

  const handleRegister = (e?: React.FormEvent) => {
    e && e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const users = (typeof window !== 'undefined' && window.__USERS__) || {}
      const emailExists = Object.values(users).some((u: any) => u.email === email)
      if (!nick || !email || !password) {
        setStatus({ type: 'error', text: 'Заполните все поля' })
        setIsSubmitting(false)
        return
      }
      if (emailExists) {
        setStatus({ type: 'error', text: 'Пользователь с таким email уже существует' })
        setIsSubmitting(false)
        return
      }

      // store by nickname
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      users[nick] = { nickname: nick, email, password, role: 'user', avatar: avatar || undefined, bio: bio || undefined, likedBy: [], dislikedBy: [] }
      // persist for debug convenience
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__USERS__ = users

      setStatus({ type: 'success', text: 'Регистрация успешна — переход на страницу входа' })
      setTimeout(() => { window.location.hash = '#/login' }, 800)
    }, 500)
  }

  const quickFill = (key: keyof typeof SEED_USERS) => {
    setNick(SEED_USERS[key].nickname)
    setEmail(SEED_USERS[key].email)
    setPassword(SEED_USERS[key].password)
    setAvatar(SEED_USERS[key].avatar || '')
    setBio(SEED_USERS[key].bio || '')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Регистрация</h2>

        <form onSubmit={handleRegister} className={styles.form}>
          <label className={styles.label}>
            <span>Никнейм</span>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><User size={16} /></span>
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                placeholder="vengart"
                className={styles.input}
                aria-label="Никнейм"
              />
            </div>
          </label>

          <label className={styles.label}>
            <span>Email</span>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><Mail size={16} /></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={styles.input}
                aria-label="Email"
              />
            </div>
          </label>

          <label className={styles.label}>
            <span>Пароль</span>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><Lock size={16} /></span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123123"
                className={styles.input}
                aria-label="Пароль"
              />
            </div>
          </label>

          <label className={styles.label}>
            <span>URL аватара</span>
            <div className={styles.inputWrap}>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className={styles.input}
                aria-label="Аватар"
              />
            </div>
          </label>

          <label className={styles.label}>
            <span>О себе</span>
            <div className={styles.inputWrap}>
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Немного о вас"
                className={styles.input}
                aria-label="О себе"
              />
            </div>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={isSubmitting}>{isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}</button>
            <button type="button" onClick={() => { window.location.hash = '#/login' }} className={styles.secondary}>К входу</button>
          </div>

          {status && <div className={styles.message} style={{ color: status.type === 'success' ? '#059669' : '#ef4444' }}>{status.text}</div>}

          <div className={styles.debug}>
            <button type="button" onClick={() => quickFill('vengart')}>Заполнить как vengart</button>
            <button type="button" onClick={() => quickFill('admin')}>Заполнить как admin</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
 
