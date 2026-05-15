import React, { useEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'

const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')

type Note = {
  id: number
  header: string
  bodyText: string
  isVisibleToPlayers: boolean
  authorId: number
}

type Session = {
  id: number
  title: string
  gameCardId?: number
  gameMasterId: number
  applications?: any[]
}

const SessionNotes: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [cardId, setCardId] = useState<number | null>(null)
  const [noteHeader, setNoteHeader] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [notePublic, setNotePublic] = useState(false)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [editMode, setEditMode] = useState(false)

  const currentUserId = getCurrentUserId()
  const currentRole = localStorage.getItem('role')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/gamesessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        if (res.ok) {
          const data: Session = await res.json()
          setSession(data)
          if (data.gameCardId) {
            setCardId(data.gameCardId)
            const notesRes = await fetch(`${BASE_URL}/gamenotes/card/${data.gameCardId}`, {
              headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (notesRes.ok) {
              const notesData = await notesRes.json()
              setNotes(notesData)
              if (notesData.length > 0) setActiveNote(notesData[0])
            }
          }
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [sessionId])

  const isOwner = String(session?.gameMasterId) === currentUserId
  const isParticipant = session?.applications?.some((a: any) => String(a.playerId) === currentUserId)
  const canEdit = isOwner || currentRole === '3' || currentRole === '4'
  const canView = canEdit || isParticipant

  const createNote = async () => {
    if (!noteHeader || !cardId) return
    const res = await fetch(`${BASE_URL}/gamenotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        header: noteHeader,
        bodyText: noteBody,
        isVisibleToPlayers: notePublic,
        gameCardId: cardId,
        authorId: parseInt(currentUserId || '0')
      })
    })
    if (res.ok) {
      const newNote = await res.json()
      setNotes(prev => [...prev, newNote])
      setActiveNote(newNote)
      setNoteHeader('')
      setNoteBody('')
      setNotePublic(false)
      setEditMode(false)
    }
  }

  const visibleNotes = notes.filter(n =>
    canEdit || n.isVisibleToPlayers
  )

  if (loading) return (
    <div style={{ padding: 24, color: '#475569' }}>Загрузка...</div>
  )

  if (!canView) return (
    <div style={{ maxWidth: 500, margin: '48px auto', textAlign: 'center', padding: 32, background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
      <h2 style={{ color: '#e6eef8', marginBottom: 8 }}>Доступ закрыт</h2>
      <p style={{ color: '#475569', marginBottom: 20 }}>Заметки доступны только участникам сессии.</p>
      <a href={`#/session/${sessionId}`} style={{ color: '#10b981' }}>← Вернуться к сессии</a>
    </div>
  )

  return (
  <div style={{ 
    display: 'flex', 
    height: 'calc(100vh - 64px)', 
    background: '#0b1220', 
    position: 'fixed', 
    top: 64, 
    left: 0, 
    right: 0, 
    bottom: 0 
  }}>

    {/* Сайдбар — фиксированная ширина 280px, не растягивается */}
    <div style={{ 
      width: '280px', 
      minWidth: '280px', 
      maxWidth: '280px', 
      background: '#0f172a', 
      borderRight: '1px solid rgba(255,255,255,0.06)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden' 
    }}>

      {/* Шапка сайдбара */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <a href={`#/session/${sessionId}`} style={{ 
          color: '#475569', 
          fontSize: 12, 
          textDecoration: 'none', 
          display: 'block', 
          marginBottom: 8, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          ← {session?.title || 'Сессия'}
        </a>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e6eef8' }}>Заметки</div>
      </div>

      {/* Список заметок — скролл внутри */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {visibleNotes.map(n => (
          <div key={n.id}
            onClick={() => { setActiveNote(n); setEditMode(false) }}
            style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: activeNote?.id === n.id ? 'rgba(16,185,129,0.08)' : 'transparent',
              border: activeNote?.id === n.id ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
              transition: 'all 0.15s', overflow: 'hidden'
            }}>
            <div style={{ 
              fontSize: 13, 
              fontWeight: 600, 
              color: '#e6eef8', 
              marginBottom: 2, 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {n.header}
            </div>
            <div style={{ fontSize: 11, color: '#334155' }}>
              {n.isVisibleToPlayers ? 'Публичная' : 'Только мастер'}
            </div>
          </div>
        ))}
        {visibleNotes.length === 0 && (
          <div style={{ padding: 12, color: '#334155', fontSize: 13 }}>Заметок пока нет</div>
        )}
      </div>

      {/* Кнопка новой заметки */}
      {canEdit && (
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            onClick={() => { setActiveNote(null); setEditMode(true) }}
            style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', background: 'linear-gradient(180deg,#10b981,#059669)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Новая заметка
          </button>
        </div>
      )}
    </div>

    {/* Основная область */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

      {/* Форма создания новой заметки */}
      {editMode && canEdit && (
        <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <h2 style={{ color: '#e6eef8', margin: 0, fontSize: 20, fontWeight: 700 }}>Новая заметка</h2>
          <input
            value={noteHeader}
            onChange={e => setNoteHeader(e.target.value)}
            placeholder="Заголовок"
            style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 16, color: '#e6eef8', outline: 'none', fontFamily: 'inherit' }}
          />
          <div data-color-mode="dark">
            <MDEditor value={noteBody} onChange={val => setNoteBody(val || '')} height={400} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={notePublic} onChange={e => setNotePublic(e.target.checked)} />
            Видна игрокам
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={createNote} disabled={!noteHeader}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: !noteHeader ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg,#10b981,#059669)', color: !noteHeader ? '#334155' : 'white', fontSize: 14, fontWeight: 600, cursor: !noteHeader ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              Сохранить
            </button>
            <button onClick={() => setEditMode(false)}
              style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Просмотр заметки */}
      {!editMode && activeNote && (
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ color: '#e6eef8', margin: '0 0 6px', fontSize: 24, fontWeight: 900 }}>{activeNote.header}</h1>
              <span style={{ fontSize: 12, color: activeNote.isVisibleToPlayers ? '#10b981' : '#475569' }}>
                {activeNote.isVisibleToPlayers ? 'Публичная заметка' : 'Только для мастера'}
              </span>
            </div>
          </div>
          <div data-color-mode="dark">
            <MDEditor.Markdown
              source={activeNote.bodyText}
              style={{ background: 'transparent', color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}
            />
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {!editMode && !activeNote && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32 }}>📝</div>
          <div style={{ fontSize: 14 }}>Выбери заметку или создай новую</div>
        </div>
      )}
    </div>
  </div>
)
}

export default SessionNotes