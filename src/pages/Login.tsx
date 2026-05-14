import React, { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import styles from './Login.module.css'

const BASE_URL = 'https://localhost:7214/api'

const Login: React.FC = () => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    e && e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, password, email: login })

      })

      if (!res.ok) {
        setStatus({ type: 'error', text: 'Неверные учётные данные' })
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', String(data.userId))
      localStorage.setItem('role', String(data.role))
      localStorage.setItem('currentUser', JSON.stringify({ 
        userId: data.userId, 
        role: data.role 
      }))

      setStatus({ type: 'success', text: 'Успешная авторизация! Перенаправление...' })
      try { window.dispatchEvent(new Event('authChange')) } catch {}
      setTimeout(() => {
        window.location.hash = '#/'
        try { window.dispatchEvent(new Event('authChange')) } catch {}
      }, 800)

    } catch {
      setStatus({ type: 'error', text: 'Ошибка соединения с сервером' })
      setIsSubmitting(false)
    }
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
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="nickname or email"
                className={styles.input}
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
                placeholder="••••••"
                className={styles.input}
              />
            </div>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={isSubmitting}>
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
            <button type="button" onClick={() => { window.location.hash = '#/register' }} className={styles.secondary}>
              Регистрация
            </button>
          </div>

          {status && (
            <div className={styles.message} style={{ color: status.type === 'success' ? '#059669' : '#ef4444' }}>
              {status.text}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login