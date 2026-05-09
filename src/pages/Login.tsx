import React, { useState, useEffect } from 'react'
import { Mail, Lock, LogIn, UserPlus, ShieldAlert } from 'lucide-react'
import styles from './Login.module.css'

type User = { nickname: string; email: string; password: string; role: 'user' | 'admin'; avatar?: string; bio?: string; likedBy?: string[]; dislikedBy?: string[] }

const SEED_USERS: Record<string, User> = {
  vengart: { nickname: 'vengart', email: 'vengartium@gmail.com', password: '123123', role: 'user', avatar: 'https://www.gaydamak.com.ua/image/cache/catalog/image/catalog/products/Patchi--Shevrony--Nashivki/Nashivka-patch-shevron-Pepe-s-sizhkoj.webp', bio: 'Игрок и мастер по Pathfinder и D&D.', likedBy: [], dislikedBy: [] },
  admin: { nickname: 'aR2Om', email: 'drunkcaydencai1ean@gmail.com', password: '123123', role: 'admin', avatar: 'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg', bio: 'Организатор сессий и координатор.', likedBy: [], dislikedBy: [] }
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // seed into window for debug if not present
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.__USERS__) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__USERS__ = SEED_USERS
    }
  }, [])

  const handleLogin = (e?: React.FormEvent) => {
    e && e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    setTimeout(() => {
      const user = Object.values(SEED_USERS).find(u => u.email === email && u.password === password)
      if (user) {
        setStatus({ type: 'success', text: 'Успешная авторизация! Перенаправление...' })
        localStorage.setItem('currentUser', JSON.stringify(user))
        // notify other UI that authentication changed in this tab (before navigation)
        try { window.dispatchEvent(new Event('authChange')) } catch {}
        // navigate after a short delay and re-dispatch to ensure header updates
        setTimeout(() => {
          window.location.hash = '#/'
          try { window.dispatchEvent(new Event('authChange')) } catch {}
        }, 800)
      } else {
        setStatus({ type: 'error', text: 'Неверные учетные данные' })
        setIsSubmitting(false)
      }
    }, 600)
  }

  const quickFill = (key: keyof typeof SEED_USERS) => {
    setEmail(SEED_USERS[key].email)
    setPassword(SEED_USERS[key].password)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Вход</h2>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            <span>Email</span>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><Mail size={16} /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vengartium@gmail.com"
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123123"
                className={styles.input}
                aria-label="Пароль"
              />
            </div>
          </label>

          <div className={styles.actions}>
            <button type="submit" onClick={() => handleLogin()} className={styles.primary} disabled={isSubmitting}>{isSubmitting ? 'Вход...' : 'Войти'}</button>
            <button type="button" onClick={() => { window.location.hash = '#/register' }} className={styles.secondary}>Регистрация</button>
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

export default Login