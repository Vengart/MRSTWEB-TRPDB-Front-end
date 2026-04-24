import React, { useEffect, useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [user, setUser] = useState<{ nickname?: string } | null>(null)

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('currentUser')
        if (raw) setUser(JSON.parse(raw))
        else setUser(null)
      } catch {
        setUser(null)
      }
    }
    load()
    window.addEventListener('storage', load)
    window.addEventListener('authChange', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('authChange', load)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('currentUser')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined') delete window.__CURRENT_USER__
    setUser(null)
    window.location.hash = '#/'
  }

  return (
    <header className={`${styles.header} w-full fixed top-0 left-0 z-50`}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.left}>
            <div className={styles.logo}>FreakyAhhh</div>
          </div>

          <div className={styles.center}>
            <select className={styles.select} aria-label="Фильтр: игра">
              <option>Все игры</option>
              <option>D&D5e</option>
              <option>Pf2e</option>
              <option>VtM5e</option>
              <option>Call Of Cthulhu 7e</option>
              <option>D&D4e</option>
              <option>PfRPG</option>
            </select>
            <select className={styles.select} aria-label="Фильтр: формат">
              <option>Все форматы</option>
              <option>Онлайн</option>
              <option>Оффлайн</option>
            </select>
            <select className={styles.select} aria-label="Фильтр: доступность">
              <option>Все</option>
              <option>Свободные</option>
              <option>Полные</option>
            </select>
          </div>

          <div className={styles.right}>
            {user ? (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button className={styles.login} onClick={() => { window.location.hash = '#/account' }}>{user.nickname || 'Аккаунт'}</button>
                <button className={styles.login} onClick={logout} style={{background:'#ef4444'}}>Выйти</button>
              </div>
            ) : (
              <button className={styles.login} onClick={() => { window.location.hash = '#/login' }}>Войти</button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
