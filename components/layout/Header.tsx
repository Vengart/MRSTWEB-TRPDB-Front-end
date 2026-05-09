import React, { useEffect, useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [user, setUser] = useState<{ nickname?: string; role?: string; gameRoles?: string[] } | null>(null)
  const [game, setGame] = useState<string>('')
  const [format, setFormat] = useState<string>('')
  const [availability, setAvailability] = useState<string>('')
  const [search, setSearch] = useState<string>('')

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

  const isGamemaster = !!(
    user && (
      (Array.isArray(user.gameRoles) && (
        user.gameRoles.includes('gamemaster') ||
        user.gameRoles.includes('gm') ||
        user.gameRoles.includes('гм')
      )) ||
      user.role === 'gamemaster' ||
      user.role === 'gm' ||
      user.role === 'гм'
    )
  )

  return (
    <header className={`${styles.header} w-full fixed top-0 left-0 z-50`}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.left}>
            <button
              className={styles.logo}
              onClick={() => { window.location.hash = '#/' }}
              aria-label="Перейти на главную"
            >
              Orichalcum
            </button>
          </div>

          <div className={styles.center}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск"
              value={search}
              onChange={(e) => {
                const val = e.currentTarget.value
                setSearch(val)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { search: val || null } }))
              }}
            />
            <select
              className={styles.select}
              aria-label="Фильтр: игра"
              value={game}
              onChange={(e) => {
                const val = e.currentTarget.value
                setGame(val)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { game: val || null } }))
              }}
            >
              <option value="">Все игры</option>
              <option value="D&D5e">D&D5e</option>
              <option value="Pf2e">Pf2e</option>
              <option value="VtM5e">VtM5e</option>
              <option value="Call Of Cthulhu 7e">Call Of Cthulhu 7e</option>
              <option value="D&D4e">D&D4e</option>
              <option value="PfRPG">PfRPG</option>
            </select>

            <select
              className={styles.select}
              aria-label="Фильтр: формат"
              value={format}
              onChange={(e) => {
                const val = e.currentTarget.value
                setFormat(val)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { format: val || null } }))
              }}
            >
              <option value="">Все форматы</option>
              <option value="Онлайн">Онлайн</option>
              <option value="Оффлайн">Оффлайн</option>
            </select>

            <select
              className={styles.select}
              aria-label="Фильтр: доступность"
              value={availability}
              onChange={(e) => {
                const val = e.currentTarget.value
                setAvailability(val)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { availability: val || null } }))
              }}
            >
              <option value="">Все</option>
              <option value="Свободные">Свободные</option>
              <option value="Полные">Полные</option>
            </select>
          </div>

          <div className={styles.right}>
            {user ? (
              <>
                {isGamemaster && (
                  <button
                    className={styles.createBtn}
                    onClick={() => { window.location.hash = '#/create-session' }}
                  >
                    + Создать сессию
                  </button>
                )}
                <button
                  className={styles.login}
                  onClick={() => { window.location.hash = '#/account' }}
                >
                  {user.nickname || 'Аккаунт'}
                </button>
                <button className={styles.logoutBtn} onClick={logout}>
                  Выйти
                </button>
              </>
            ) : (
              <button
                className={styles.loginPrimary}
                onClick={() => { window.location.hash = '#/login' }}
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
