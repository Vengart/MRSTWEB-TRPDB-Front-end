import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const calendarStyles = `
  .react-calendar { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; font-family: inherit; color: #e6eef8; width: 100%; border: none; }
  .react-calendar__tile { border-radius: 6px; padding: 10px; font-size: 13px; }
  .react-calendar__tile:enabled:hover { background: #1e293b; }
  .react-calendar__tile--now { background: rgba(16,185,129,0.1); border: 1px solid #10b981; }
  .date-match { background: #10b981 !important; color: white !important; font-weight: bold; }
  .date-partial { background: #ef4444 !important; color: white !important; opacity: 0.7; }
  .react-calendar__navigation button { color: #e6eef8; font-size: 14px; }
`;

const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')
const getCurrentUserId = () => localStorage.getItem('userId')

type Availability = {
  id?: number;
  playerId: number;
  date: string;
  startTime: string;
  endTime: string;
}

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
  gameCardId?: number
}

const SessionDetail: React.FC<{ id: string; onJoin: (id: string) => Promise<void> }> = ({ id, onJoin }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [myTime, setMyTime] = useState({ start: '18:00', end: '22:00' })
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '', description: '', system: '', setting: '',
    maxPlayers: 6, coverImageUrl: '', duration: '', price: ''
  })
  const openEdit = () => {
    if (!session) return
    setEditForm({
      title: session.title || '',
      description: session.description || '',
      system: session.system || '',
      setting: session.setting || '',
      maxPlayers: session.maxPlayers || 6,
      coverImageUrl: session.coverImageUrl || '',
      duration: session.duration || '',
      price: session.price || ''
    })
    setEditMode(true)
  }

  const saveEdit = async () => {
    if (!session) return
    const res = await fetch(`${BASE_URL}/gamesessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...session, ...editForm })
    })
    if (res.ok) {
      const updated = await res.json()
      setSession(updated)
      setEditMode(false)
    }
  }

  const deleteSession = async () => {
    if (!session) return
    if (!confirm('Удалить сессию? Это действие необратимо.')) return
    const res = await fetch(`${BASE_URL}/gamesessions/${session.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (res.ok) window.location.hash = '#/'
  }
  const currentUserId = getCurrentUserId()
  const currentRole = localStorage.getItem('role')

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
          loadAvailability(data.id)
        }
      } catch {}
      setLoading(false)
    }
    fetch_()
  }, [id])

  const loadAvailability = async (sessionId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/availability/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) setAvailabilities(await res.json())
    } catch (e) {
      setAvailabilities([])
    }
  }

  const saveMyTime = async () => {
    if (!session) return
    const res = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        gameSessionId: session.id,
        date: selectedDate.toISOString().split('T')[0],
        startTime: myTime.start,
        endTime: myTime.end,
        playerId: parseInt(currentUserId || '0')
      })
    })
    if (res.ok) loadAvailability(session.id)
  }

  const handleJoin = async () => {
    if (isOwner || isParticipant || isFull || joining) return;
    setJoining(true)
    await onJoin(String(session?.id))
    setJoining(false)
  }

  const isOwner = String(session?.gameMasterId) === currentUserId
  const isParticipant = session?.applications?.some((a: any) => String(a.playerId) === currentUserId && a.status === 1)
  const players = session?.applications?.length || 0
  const isFull = players >= (session?.maxPlayers || 0)
  const canInteractWithCalendar = isOwner || isParticipant

  const getTileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null;
    const dateStr = date.toISOString().split('T')[0];
    const slotsOnDay = availabilities.filter(a => a.date.split('T')[0] === dateStr);
    if (slotsOnDay.length === 0) return null;
    const totalParticipants = (session?.applications?.filter(a => a.status === 1).length || 0) + 1;
    return slotsOnDay.length >= totalParticipants ? 'date-match' : 'date-partial';
  };

  if (loading) return <div style={{ padding: 24, color: '#475569' }}>Загрузка...</div>
  if (!session) return <div style={{ padding: 24 }}><h2 style={{ color: '#e6eef8' }}>Сессия не найдена</h2></div>

  const handleApplicationAction = async (applicationId: number, newStatus: number) => {
    try {
      const res = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify(newStatus)
      });

      if (res.ok) {
        // Обновляем данные сессии локально, чтобы заявка исчезла из "новых" и появилась в "участниках"
        const updatedApps = session.applications?.map((a: any) => 
          a.id === applicationId ? { ...a, status: newStatus } : a
        );
        setSession({ ...session, applications: updatedApps });
      }
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };
  const inpStyle: React.CSSProperties = {
    background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '10px 14px', fontSize: 14,
    color: '#e6eef8', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
  }
  const lblStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6
  }
  return (
    <div style={{ 
      maxWidth: 1400, // Увеличиваем общий лимит
      margin: '40px auto', 
      padding: '0 40px',
      display: 'flex', 
      justifyContent: 'center', // Центрируем всю конструкцию
      gap: '40px', // Увеличиваем расстояние между колонками
      alignItems: 'flex-start' 
    }}>
{/* Модалка редактирования */}
{editMode && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ color: '#e6eef8', margin: 0, fontSize: 20, fontWeight: 700 }}>Редактировать сессию</h2>

      <div>
        <label style={lblStyle}>Название</label>
        <input style={inpStyle} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
      </div>
      <div>
        <label style={lblStyle}>Описание</label>
        <textarea style={{...inpStyle, resize: 'none', lineHeight: 1.6}} rows={4} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lblStyle}>Система</label>
          <select style={{...inpStyle, cursor: 'pointer'}} value={editForm.system} onChange={e => setEditForm({...editForm, system: e.target.value})}>
            <option value="">Выберите</option>
            <option value="D&D5e">D&D5e</option>
            <option value="Pf2e">Pf2e</option>
            <option value="VtM5e">VtM5e</option>
            <option value="Call Of Cthulhu 7e">Call Of Cthulhu 7e</option>
          </select>
        </div>
        <div>
          <label style={lblStyle}>Формат</label>
          <select style={{...inpStyle, cursor: 'pointer'}} value={editForm.setting} onChange={e => setEditForm({...editForm, setting: e.target.value})}>
            <option value="">Выберите</option>
            <option value="Онлайн">Онлайн</option>
            <option value="Оффлайн">Оффлайн</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lblStyle}>Длительность</label>
          <input style={inpStyle} value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} placeholder="4 ч" />
        </div>
        <div>
          <label style={lblStyle}>Цена</label>
          <input style={inpStyle} value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} placeholder="Бесплатно" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lblStyle}>Мест</label>
          <input style={inpStyle} type="number" value={editForm.maxPlayers} onChange={e => setEditForm({...editForm, maxPlayers: parseInt(e.target.value) || 6})} />
        </div>
        <div>
          <label style={lblStyle}>URL обложки</label>
          <input style={inpStyle} value={editForm.coverImageUrl} onChange={e => setEditForm({...editForm, coverImageUrl: e.target.value})} placeholder="https://..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={saveEdit} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(180deg,#10b981,#059669)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Сохранить
        </button>
        <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Отмена
        </button>
      </div>
    </div>
  </div>
)}
      {/* ЛЕВАЯ КОЛОНКА: Основной контент (60%) */}
      <div style={{ 
        flex: '0 1 60%', // Занимает ровно 60% и не растет больше
        minWidth: 600,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1 }}>
          <div 
            onClick={handleJoin}
            style={{ 
              position: 'relative', 
              cursor: (!isOwner && !isParticipant && !isFull) ? 'pointer' : 'default',
              overflow: 'hidden',
              borderRadius: 16,
              marginBottom: 24
            }}
          >
            {session.coverImageUrl && (
              <img 
                src={session.coverImageUrl} 
                alt="cover" 
                style={{ 
                  width: '100%', 
                  height: 400, // Фиксируем высоту, чтобы не скроллить вечность
                  objectFit: 'cover', 
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)' // Добавит глубины на темном фоне
                }} 
              />
            )}
            {!isOwner && !isParticipant && !isFull && (
              <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(16,185,129,0.9)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                Нажми на фото, чтобы записаться
              </div>
            )}
          </div>

          <h1 style={{ margin: '0 0 8px', color: '#e6eef8', fontSize: 32, fontWeight: 900 }}>{session.title}</h1>
          <div style={{ color: '#64748b', marginBottom: 20 }}>{session.system} • {session.setting}</div>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#e6eef8', fontSize: 18, marginBottom: 12 }}>Описание</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 15 }}>{session.description}</p>
          </section>

          <section>
            <h3 style={{ color: '#e6eef8', fontSize: 18, marginBottom: 16 }}>Участники ({players}/{session.maxPlayers})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {/* СЕКЦИЯ ГМ: Управление заявками */}
                {isOwner && session.applications?.some((a: any) => a.status === 0) && (
                  <section style={{ marginTop: 40, padding: 24, background: 'rgba(16,185,129,0.05)', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <h3 style={{ color: '#10b981', fontSize: 20, margin: '0 0 20px' }}>📩 Новые заявки на игру</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {session.applications?.filter((a: any) => a.status === 0).map((app: any) => (
                        <div key={app.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: '#0f172a', 
                          padding: '16px 20px', 
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              👤
                            </div>
                            <div>
                              <div style={{ color: '#e6eef8', fontWeight: 600 }}>Игрок #{app.playerId}</div>
                              <a href={`#/profile/${app.playerId}`} style={{ color: '#3b82f6', fontSize: 12, textDecoration: 'none' }}>
                                Посмотреть профиль →
                              </a>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button 
                              onClick={() => handleApplicationAction(app.id, 1)} // 1 - Принять
                              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Принять
                            </button>
                            <button 
                              onClick={() => handleApplicationAction(app.id, 2)} // 2 - Отклонить
                              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
            </div>
          </section>
        </div>

      </div>

      {/* ПРАВАЯ КОЛОНКА: Сайдбар (Календарь в углу) */}
      <div style={{ 
        width: 340, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        position: 'sticky',
        top: 100 // Чтобы при скролле он не прилипал к самому верху шапки
      }}>
        <style>{calendarStyles}</style>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        
        {/* ЛЕВАЯ КОЛОНКА: Контент */}
        
        {/* ПРАВАЯ КОЛОНКА: Сайдбар (Календарь + Кнопки) */}
        <div style={{ width: 320, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Блок управления/записи */}
          <div style={{ background: '#0f172a', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e6eef8' }}>{session.price || 'Бесплатно'}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Стоимость участия</div>
            </div>
            
            {!isOwner && !isParticipant && (
              <button 
                onClick={handleJoin} 
                disabled={isFull || joining}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: isFull ? '#1e293b' : 'linear-gradient(180deg,#10b981,#059669)', color: isFull ? '#475569' : 'white', fontWeight: 700, cursor: isFull ? 'not-allowed' : 'pointer' }}
              >
                {joining ? 'Запись...' : isFull ? 'Мест нет' : 'Подать заявку'}
              </button>
            )}
            
            {/* {isOwner && <div style={{ color: '#10b981', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>Вы — Гейммастер</div>}
            {isParticipant && <div style={{ color: '#10b981', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>Вы участвуете в сессии</div>} */}
          </div>
          {/* Кнопки управления для GM */}
          {isOwner && (
            <button onClick={openEdit}
              style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✏️ Редактировать сессию
            </button>
          )}

          {/* Кнопка удаления для модератора/админа и GM */}
          {(isOwner || currentRole === '3' || currentRole === '4') && (
            <button onClick={deleteSession}
              style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              🗑️ Удалить сессию
            </button>
          )}
          {/* Блок Календаря */}
          {canInteractWithCalendar && (
            <div style={{ background: '#0f172a', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ color: '#e6eef8', margin: '0 0 16px', fontSize: 15 }}>Сбор группы</h4>
              <Calendar 
                onChange={(val) => {
                  const date = Array.isArray(val) ? val[0] : val;
                  if (date instanceof Date) setSelectedDate(date);
                }} 
                value={selectedDate}
                tileClassName={getTileClassName as any}
              />
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <input type="time" value={myTime.start} onChange={e => setMyTime({...myTime, start: e.target.value})} style={{ flex: 1, background: '#0b1220', border: '1px solid #1e293b', color: 'white', padding: '6px', borderRadius: 6, fontSize: 12 }} />
                <input type="time" value={myTime.end} onChange={e => setMyTime({...myTime, end: e.target.value})} style={{ flex: 1, background: '#0b1220', border: '1px solid #1e293b', color: 'white', padding: '6px', borderRadius: 6, fontSize: 12 }} />
              </div>
              <button onClick={saveMyTime} style={{ width: '100%', marginTop: 12, padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Отметить время
              </button>
            </div>
          )}

          {/* Блок Заметок (теперь под календарем) */}
          {(isOwner || isParticipant || currentRole === '3' || currentRole === '4') && (
            <a 
              href={`#/session/${session.id}/notes`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10,
                padding: '16px', 
                borderRadius: 16, 
                background: '#0f172a', 
                border: '1px solid rgba(16,185,129,0.2)', 
                color: '#10b981', 
                fontSize: 14, 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              📝 Заметки сессии
            </a>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

export default SessionDetail