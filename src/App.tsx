import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout'
import { SessionCard } from '../components/ui'
import SessionDetail from './pages/SessionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Profile from './pages/Profile'
import CreateSession from './pages/CreateSession'

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([
    {
      id: 'raid-keepers',
      image: 'https://i.redd.it/2k34ydhyvkp31.jpg',
      tags: ['Онлайн', 'D&D5e'],
      title: 'Рейд: Хранители Песков',
      date: '15 апр 2026',
      duration: '10 ч',
      price: 'Бесплатно',
      description: 'Короткое описание сессии — механика, уровни и ожидания от участников. Подготовьтесь к эпическим боссам и командной работе.',
      players: 2,
      capacity: 6,
      owner: 'vengart',
      participants: [{id:'vengart',name:'vengart',profileUrl:'#/profile/vengart',avatar:'https://www.gaydamak.com.ua/image/cache/catalog/image/catalog/products/Patchi--Shevrony--Nashivki/Nashivka-patch-shevron-Pepe-s-sizhkoj.webp'},{id:'admin',name:'aR2Om',profileUrl:'#/profile/admin',avatar:'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg'}]
    },
    {
      id: 'last-training',
      image: 'https://thedmlair.com/cdn/shop/articles/perfect-dungeon.jpg?v=1705769581',
      tags: ['Оффлайн', 'Pf2e'],
      title: 'Последняя тренировка',
      date: '20 апр 2026',
      duration: '5 ч',
      price: '200 ш мерплов',
      description: 'Маленькое приключение, которое позволяет больше разобрться в pathfinder 2e',
      players: 1,
      capacity: 6,
      owner: 'admin',
      participants: [{id:'admin',name:'aR2Om',profileUrl:'#/profile/admin',avatar:'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg'}]
    }
  ])

  // load persisted sessions from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sessions')
      if (raw) {
        setSessions(JSON.parse(raw))
      }
    } catch (e) {
      // ignore
    }
  }, [])
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    description: '',
    game: '',
    format: '',
    date: '',
    duration: '',
    price: '',
    capacity: 6,
    image: ''
  })

  const hasGamemasterRole = (u: any) => {
    const roles = Array.isArray(u?.gameRoles) ? u.gameRoles : []
    const normalizedRoles = roles.map((r: string) => String(r).toLowerCase())
    const role = String(u?.role || '').toLowerCase()
    return (
      normalizedRoles.includes('gamemaster') ||
      normalizedRoles.includes('gm') ||
      normalizedRoles.includes('гм') ||
      role === 'gamemaster' ||
      role === 'gm' ||
      role === 'гм'
    )
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      if (raw) setCurrentUser(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    const onHash = () => {
      // debug: log hash changes to help diagnose navigation issues
      // eslint-disable-next-line no-console
      console.log('[router] hashchange ->', window.location.hash)
      setRoute(window.location.hash || '#/')
    }
    // debug: initial route log
    // eslint-disable-next-line no-console
    console.log('[router] init route ->', window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [filters, setFilters] = useState<{game?: string | null; format?: string | null; availability?: string | null; search?: string | null}>({})

  useEffect(() => {
    const onFilters = (e: Event) => {
      // @ts-ignore
      const d = e.detail || {}
      setFilters(prev => ({ ...prev, ...(d || {}) }))
    }
    window.addEventListener('filtersChanged', onFilters as EventListener)
    return () => window.removeEventListener('filtersChanged', onFilters as EventListener)
  }, [])

  // Синхронизировать currentUser при изменении authChange
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const raw = localStorage.getItem('currentUser')
        if (raw) setCurrentUser(JSON.parse(raw))
        else setCurrentUser(null)
      } catch {}
    }
    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      if (raw) setCurrentUser(JSON.parse(raw))
      else setCurrentUser(null)
    } catch {}
  }, [route])

  const addNewSession = () => {
    if (!newSessionForm.title || !newSessionForm.game) return
    const id = newSessionForm.title.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now()
    const newSession = {
      id,
      title: newSessionForm.title,
      description: newSessionForm.description,
      tags: [newSessionForm.format, newSessionForm.game].filter(Boolean),
      date: newSessionForm.date,
      duration: newSessionForm.duration,
      price: newSessionForm.price,
      capacity: newSessionForm.capacity,
      players: 1,
      image: newSessionForm.image,
      owner: currentUser?.nickname,
      participants: [{ id: currentUser?.nickname, name: currentUser?.nickname, avatar: currentUser?.avatar }]
    }
    setSessions(prev => [...prev, newSession])
    setNewSessionForm({ title: '', description: '', game: '', format: '', date: '', duration: '', price: '', capacity: 6, image: '' })
    window.location.hash = '#/'
  }

  const joinSession = (id: string) => {
    if (!currentUser) {
      window.location.hash = '#/login'
      return
    }
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s
      const already = (s.participants || []).some((p: any) => String(p.id) === String(currentUser.nickname))
      if (already) {
        // eslint-disable-next-line no-alert
        alert('Вы уже записаны в эту сессию')
        return s
      }
      if ((s.players || 0) >= (s.capacity || 0)) {
        // eslint-disable-next-line no-alert
        alert('Сессия заполнена')
        return s
      }
      const updated = {
        ...s,
        players: (s.players || 0) + 1,
        participants: [ ...(s.participants || []), { id: currentUser.nickname, name: currentUser.nickname, avatar: currentUser.avatar } ]
      }
      return updated
    }))
  }

  const deleteSession = (id: string) => {
    if (!id) return
    const target = sessions.find(s => s.id === id)
    if (!target) return
    // only owner (gm) can delete
    if (String(target.owner) !== String(currentUser?.nickname)) {
      // eslint-disable-next-line no-alert
      alert('Удалять сессию может только её гейммастер')
      return
    }
    // confirm
    // eslint-disable-next-line no-alert
    if (!confirm('Удалить сессию? Это действие необратимо.')) return
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  // keep a global map and localStorage in sync so SessionDetail (which reads window.__SESSIONS__) can find sessions
  useEffect(() => {
    try {
      // rebuild global map from current sessions
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__SESSIONS__ = {}
      sessions.forEach(s => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__SESSIONS__[s.id] = s
      })
      localStorage.setItem('sessions', JSON.stringify(sessions))
    } catch (e) {
      // ignore
    }
  }, [sessions])

  // simple hash router: #/session/:id or #/login or #/register or #/
  if (route === '#/login') {
    return <Layout><Login /></Layout>
  }

  if (route === '#/register') {
    return <Layout><Register /></Layout>
  }

  if (route === '#/account') {
    return <Layout><Account /></Layout>
  }

  if (route.startsWith('#/profile/')) {
    const id = route.replace('#/profile/', '')
    return <Layout><Profile id={id} /></Layout>
  }

  if (route.startsWith('#/session/')) {
    const id = route.replace('#/session/', '')
    return <Layout><SessionDetail id={id} /></Layout>
  }

  const isGamemaster = hasGamemasterRole(currentUser)

  if (route === '#/create-session') {
    return (
      <Layout>
        <CreateSession
          isGamemaster={isGamemaster}
          form={newSessionForm}
          setForm={setNewSessionForm}
          onCreate={addNewSession}
          onCancel={() => { window.location.hash = '#/' }}
        />
      </Layout>
    )
  }

  return (
  <Layout>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Заголовок */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#e6eef8',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          Игровые <span style={{ color: '#10b981' }}>сессии</span>
        </h1>
        <p style={{ color: '#475569', fontSize: '14px', marginTop: '6px' }}>
          Найди стол или собери свою команду
        </p>
      </div>

      {/* Сетка карточек */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {(() => {
          const filtered = sessions.filter(s => {
            if (filters.game && !s.tags.includes(filters.game)) return false
            if (filters.format && !s.tags.includes(filters.format)) return false
            if (filters.availability) {
              if (filters.availability === 'Свободные' && !(s.players < s.capacity)) return false
              if (filters.availability === 'Полные' && !(s.players >= s.capacity)) return false
            }
            if (filters.search) {
              const q = filters.search.toLowerCase()
              if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false
            }
            return true
          })

          return filtered.map(s => (
            <SessionCard
              key={s.id}
              id={s.id}
              image={s.image}
              tags={s.tags}
              title={s.title}
              date={s.date}
              duration={s.duration}
              price={s.price}
              description={s.description}
              players={s.players}
              capacity={s.capacity}
              participants={s.participants}
              onDelete={() => deleteSession(s.id)}
              showDelete={String(currentUser?.nickname) === String(s.owner)}
              onApply={() => joinSession(s.id)}
            />
          ))
        })()}
      </section>
    </div>
  </Layout>
  )
}

export default App

