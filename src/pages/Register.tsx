import React, { useState } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import styles from './Login.module.css'

const BASE_URL = 'https://localhost:7214/api'

const Register: React.FC = () => {
  const [nick, setNick] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async (e?: React.FormEvent) => {
    e && e.preventDefault()
    if (!nick || !email || !password) {
      setStatus({ type: 'error', text: 'Заполните все поля' })
      return
    }
    setIsSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: nick, password, email })
      })

      if (!res.ok) {
        const err = await res.json()
        setStatus({ type: 'error', text: err.message || 'Пользователь уже существует' })
        setIsSubmitting(false)
        return
      }

      setStatus({ type: 'success', text: 'Регистрация успешна — переход на страницу входа' })
      setTimeout(() => { window.location.hash = '#/login' }, 800)

    } catch {
      setStatus({ type: 'error', text: 'Ошибка соединения с сервером' })
      setIsSubmitting(false)
    }
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
                placeholder="••••••"
                className={styles.input}
              />
            </div>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <button type="button" onClick={() => { window.location.hash = '#/login' }} className={styles.secondary}>
              К входу
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

export default Register