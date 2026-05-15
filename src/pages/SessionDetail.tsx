import React, { useEffect, useState } from 'react'

const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')

type Session = {
  id: number
  title: string
  description?: string
  system?: string
  setting?: string
  scheduledAt?: string
  duration?: string
  price?: string
  coverImageUrl?: string
  maxPlayers: number
  status: number
  gameMasterId: number
  applications?: any[]
}

const SessionDetail: React.FC<{ id: string; onJoin: (id: string) => Promise<void> }> = ({ id, onJoin }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const currentUserId = getCurrentUserId()
 type Note = {
    id: number
    header: string
    bodyText: string
    isVisibleToPlayers: boolean
    authorId: number
  }

  const [notes, setNotes] = useState<Note[]>([])
  const [noteHeader, setNoteHeader] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [notePublic, setNotePublic] = useState(false)
  const [cardId, setCardId] = useState<number | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/gamesessions/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
          }
        })
        if (res.ok) {
          const data = await res.json()
          setSession(data)
          if (data.gameCardId) {
            setCardId(data.gameCardId)
            const notesRes = await fetch(`${BASE_URL}/gamenotes/card/${data.gameCardId}`, {
              headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (notesRes.ok) setNotes(await notesRes.json())
          }
        }
      } catch {}
      setLoading(false)
    }
    fetch_()
  }, [id])

  if (loading) return (
    <div style={{ padding: 24, color: '#475569' }}>Загрузка...</div>
  )

  if (!session) return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#e6eef8' }}>Сессия не найдена</h2>
      <p style={{ color: '#475569' }}>Данные сессии отсутствуют.</p>
      <a href="#/" style={{ color: '#10b981' }}>← Вернуться на главную</a>
    </div>
  )
 
  const players = session.applications?.length || 0
  const isOwner = String(session.gameMasterId) === currentUserId
  const isFull = players >= session.maxPlayers
  const tags = [session.system, session.setting].filter(Boolean)

  const currentRole = localStorage.getItem('role')
  const isParticipant = session.applications?.some(
    (a: any) => String(a.playerId) === currentUserId
  )
  const canSeeNotes = isOwner ||
    currentRole === '3' ||
    currentRole === '4' ||
    isParticipant

  const handleJoin = async () => {
    setJoining(true)
    await onJoin(String(session.id))
    setJoining(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {session.coverImageUrl && (
          <img src={session.coverImageUrl} alt="cover"
            style={{ width: 320, height: 220, objectFit: 'cover', borderRadius: 12 }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: '#e6eef8', fontSize: 28, fontWeight: 900 }}>{session.title}</h1>
          <div style={{ color: '#64748b', marginTop: 8 }}>{tags.join(' • ')}</div>
          <div style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>
            {session.scheduledAt && <span>{new Date(session.scheduledAt).toLocaleDateString('ru-RU')} · </span>}
            {session.duration && <span>{session.duration} · </span>}
            {session.price && <span>{session.price}</span>}
          </div>

          {/* Прогресс мест */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
              Участников: {players} / {session.maxPlayers}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 6, width: 200 }}>
              <div style={{ background: '#10b981', borderRadius: 999, height: 6, width: `${Math.min((players / session.maxPlayers) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Кнопка записи */}
          {!isOwner && (
            <button
              onClick={handleJoin}
              disabled={isFull || joining}
              style={{
                marginTop: 20, padding: '10px 24px', borderRadius: 8, border: 'none',
                background: isFull ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg,#10b981,#059669)',
                color: isFull ? '#334155' : 'white', fontSize: 14, fontWeight: 600,
                cursor: isFull ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
              }}
            >
              {joining ? 'Отправка...' : isFull ? 'Сессия заполнена' : 'Подать заявку'}
            </button>
          )}
          {isOwner && (
            <div style={{ marginTop: 20, fontSize: 13, color: '#10b981' }}>
              Вы — Гейммастер этой сессии
            </div>
          )}
        </div>
      </div>

      {/* Описание */}
      {session.description && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ color: '#e6eef8', fontWeight: 700, marginBottom: 8 }}>Описание</h3>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>{session.description}</p>
        </section>
      )}

      {/* Участники */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ color: '#e6eef8', fontWeight: 700, marginBottom: 8 }}>
          Заявки ({players})
        </h3>
        {players === 0 ? (
          <p style={{ color: '#64748b' }}>Пока никто не записан. Будьте первым!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {session.applications?.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
                  {a.playerId}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#e6eef8' }}>Игрок #{a.playerId}</div>
                  <div style={{ fontSize: 12, color: a.status === 1 ? '#10b981' : a.status === 2 ? '#ef4444' : '#475569' }}>
                    {a.status === 1 ? 'Одобрен' : a.status === 2 ? 'Отклонён' : 'На рассмотрении'}
                  </div>
                  {a.message && <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>{a.message}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
        {canSeeNotes && (
          <a href={`#/session/${session.id}/notes`}
            style={{ display: 'inline-block', marginTop: 24, padding: '9px 20px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 14, textDecoration: 'none' }}>
            📝 Открыть заметки сессии
          </a>
        )}
      <p style={{ marginTop: 24 }}>
        <a href="#/" style={{ color: '#10b981', fontSize: 14 }}>← Вернуться</a>
      </p>
    </div>
  )
}

export default SessionDetail