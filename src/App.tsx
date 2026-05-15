import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout'
import { SessionCard } from '../components/ui'
import SessionDetail from './pages/SessionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Profile from './pages/Profile'
import CreateSession from './pages/CreateSession'

const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')
const getCurrentRole = () => localStorage.getItem('role')

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/')
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{ game?: string | null; format?: string | null; availability?: string | null; search?: string | null }>({})

  const isGamemaster = () => {
    const role = getCurrentRole()
    return role === '2' || role === '4' // GameMaster или Admin
  }

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/gamesessions`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onFilters = (e: Event) => {
      // @ts-ignore
      const d = e.detail || {}
      setFilters(prev => ({ ...prev, ...d }))
    }
    window.addEventListener('filtersChanged', onFilters as EventListener)
    return () => window.removeEventListener('filtersChanged', onFilters as EventListener)
  }, [])

  const handleCreateSession = async (form: any) => {
    const userId = getCurrentUserId()
    if (!userId) { window.location.hash = '#/login'; return }

    const body = {
      title: form.title,
      description: form.description,
      system: form.game,
      setting: form.format,
      maxPlayers: form.capacity,
      coverImageUrl: form.image || null,
      status: 1, // Open
      scheduledAt: form.date || null,
      gameMasterId: parseInt(userId),
    }

    try {
      const res = await fetch(`${BASE_URL}/gamesessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        await fetchSessions()
        window.location.hash = '#/'
      }
    } catch {}
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Удалить сессию?')) return
    try {
      const res = await fetch(`${BASE_URL}/gamesessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) await fetchSessions()
    } catch {}
  }

  const handleJoinSession = async (id: string) => {
    const userId = getCurrentUserId()
    if (!userId) { window.location.hash = '#/login'; return }

    try {
      const res = await fetch(`${BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          gameSessionId: parseInt(id),
          playerId: parseInt(userId),
          message: '',
          status: 0
        })
      })
      if (res.ok) {
        await fetchSessions()
        alert('Заявка подана!')
      } else {
        alert('Не удалось подать заявку — возможно, вы уже записаны или сессия заполнена')
      }
    } catch {}
  }

  if (route === '#/login') return <Layout><Login /></Layout>
  if (route === '#/register') return <Layout><Register /></Layout>
  if (route === '#/account') return <Layout><Account /></Layout>

  if (route.startsWith('#/profile/')) {
    const id = route.replace('#/profile/', '')
    return <Layout><Profile id={id} /></Layout>
  }

  if (route.startsWith('#/session/')) {
    const id = route.replace('#/session/', '')
    return <Layout><SessionDetail id={id} onJoin={handleJoinSession} /></Layout>
  }

  if (route === '#/create-session') {
    return (
      <Layout>
        <CreateSession
          isGamemaster={isGamemaster()}
          onCreate={handleCreateSession}
          onCancel={() => { window.location.hash = '#/' }}
        />
      </Layout>
    )
  }

  const filtered = sessions.filter(s => {
    const tags = [s.system, s.setting].filter(Boolean)
    if (filters.game && !tags.includes(filters.game)) return false
    if (filters.format && !tags.includes(filters.format)) return false
    if (filters.availability === 'Свободные' && !((s.applications?.length || 0) < s.maxPlayers)) return false
    if (filters.availability === 'Полные' && !((s.applications?.length || 0) >= s.maxPlayers)) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!s.title?.toLowerCase().includes(q) && !s.description?.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#e6eef8', margin: 0, letterSpacing: '-0.5px' }}>
            Игровые <span style={{ color: '#10b981' }}>сессии</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '6px' }}>
            Найди стол или собери свою команду
          </p>
        </div>

        {loading ? (
          <div style={{ color: '#475569' }}>Загрузка...</div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filtered.map(s => (
              <SessionCard
                key={s.id}
                id={String(s.id)}
                image={s.coverImageUrl}
                tags={[s.system, s.setting].filter(Boolean)}
                title={s.title}
                date={s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('ru-RU') : ''}
                description={s.description}
                players={s.applications?.length || 0}
                capacity={s.maxPlayers}
                participants={[]}
                onDelete={() => handleDeleteSession(String(s.id))}
                showDelete={String(s.gameMasterId) === getCurrentUserId()}
                onApply={() => handleJoinSession(String(s.id))}
              />
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}

export default App