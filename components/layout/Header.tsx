import React, { useEffect, useState } from 'react'
import styles from './Header.module.css'

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null)
  const [isGamemaster, setIsGamemaster] = useState(false)
  const currentRole = localStorage.getItem('role')
  const [game, setGame] = useState('')
  const [format, setFormat] = useState('')
  const [availability, setAvailability] = useState('')
  const [search, setSearch] = useState('')

  const loadUser = () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')

    if (token && userId) {
      // Загружаем имя пользователя с бэка
      fetch(`https://localhost:7214/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setUserName(data.userName)
          else setUserName(null)
        })
        .catch(() => setUserName(null))

      setIsGamemaster(role === '2' || role === '4') // GameMaster или Admin
    } else {
      setUserName(null)
      setIsGamemaster(false)
    }
  }

  useEffect(() => {
    loadUser()
    window.addEventListener('authChange', loadUser)
    return () => window.removeEventListener('authChange', loadUser)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('currentUser')
    setUserName(null)
    setIsGamemaster(false)
    window.location.hash = '#/'
    try { window.dispatchEvent(new Event('authChange')) } catch {}
  }

  return (
    <header className={`${styles.header} w-full fixed top-0 left-0 z-50`}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.left}>
            <button className={styles.logo} onClick={() => { window.location.hash = '#/' }} aria-label="На главную">
              Orichalcum
            </button>
          </div>

          <div className={styles.center}>
            <input type="text" className={styles.searchInput} placeholder="Поиск" value={search}
              onChange={e => {
                setSearch(e.currentTarget.value)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { search: e.currentTarget.value || null } }))
              }} />

            <select className={styles.select} value={game}
              onChange={e => {
                setGame(e.currentTarget.value)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { game: e.currentTarget.value || null } }))
              }}>
              <option value="">Все игры</option>
              <option value="D&D5e">D&D5e</option>
              <option value="Pf2e">Pf2e</option>
              <option value="VtM5e">VtM5e</option>
              <option value="Call Of Cthulhu 7e">Call Of Cthulhu 7e</option>
              <option value="D&D4e">D&D4e</option>
              <option value="PfRPG">PfRPG</option>
            </select>

            <select className={styles.select} value={format}
              onChange={e => {
                setFormat(e.currentTarget.value)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { format: e.currentTarget.value || null } }))
              }}>
              <option value="">Все форматы</option>
              <option value="Онлайн">Онлайн</option>
              <option value="Оффлайн">Оффлайн</option>
            </select>

            <select className={styles.select} value={availability}
              onChange={e => {
                setAvailability(e.currentTarget.value)
                window.dispatchEvent(new CustomEvent('filtersChanged', { detail: { availability: e.currentTarget.value || null } }))
              }}>
              <option value="">Все</option>
              <option value="Свободные">Свободные</option>
              <option value="Полные">Полные</option>
            </select>
          </div>
              
          <div className={styles.right}>
            {userName ? (
              <>
                {isGamemaster && currentRole !== '4' && (
                  <button className={styles.createBtn} onClick={() => { window.location.hash = '#/create-session' }}>
                    + Создать сессию
                  </button>
                )}
                {currentRole === '4' && (
                  <button className={styles.createBtn}
                    onClick={() => { window.location.hash = '#/admin' }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    Админ панель
                  </button>
                )}
                <button className={styles.login} onClick={() => { window.location.hash = '#/account' }}>
                  {userName}
                </button>
                <button className={styles.logoutBtn} onClick={logout}>
                  Выйти
                </button>
              </>
            ) : (
              <button className={styles.loginPrimary} onClick={() => { window.location.hash = '#/login' }}>
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