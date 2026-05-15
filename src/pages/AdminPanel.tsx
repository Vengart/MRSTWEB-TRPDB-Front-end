import React, { useEffect, useState } from 'react'
const currentUserId = localStorage.getItem('userId')
const BASE_URL = 'https://localhost:7214/api'
const getToken = () => localStorage.getItem('token')

type User = {
  id: number
  userName: string
  email: string
  bio?: string
  avatarUrl?: string
  firstName?: string
  lastName?: string
  role: number
  isActive: boolean
}

const ROLES: Record<number, string> = {
  0: 'Guest', 1: 'Player', 2: 'GameMaster', 3: 'Moderator', 4: 'Admin'
}

const ROLE_COLORS: Record<number, string> = {
  0: '#475569', 1: '#3b82f6', 2: '#10b981', 3: '#f59e0b', 4: '#ef4444'
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ userName: '', email: '', role: 1, isActive: true })
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'users'>('users')
  

  const currentRole = localStorage.getItem('role')
  if (currentRole !== '4') {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: 32, background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
        <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Доступ запрещён</h2>
        <p style={{ color: '#475569', marginBottom: 20 }}>Эта страница доступна только администраторам.</p>
        <a href="#/" style={{ color: '#10b981' }}>← На главную</a>
      </div>
    )
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) setUsers(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditForm({ userName: user.userName, email: user.email, role: user.role, isActive: user.isActive })
  }

  const saveEdit = async () => {
    if (!editUser) return
    const res = await fetch(`${BASE_URL}/users/${editUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...editForm })
    })
    if (res.ok) {
      setEditUser(null)
      fetchUsers()
    }
  }

  const softDeleteUser = async (id: number) => {
  if (!confirm('Заблокировать пользователя?')) return
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (res.ok) fetchUsers()
}

const hardDeleteUser = async (id: number) => {
  if (!confirm('УДАЛИТЬ НАВСЕГДА? Это действие необратимо!')) return
  const res = await fetch(`${BASE_URL}/users/${id}/permanent`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (res.ok) fetchUsers()
}

  const filtered = users.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const inp: React.CSSProperties = {
    background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '9px 12px', fontSize: 14,
    color: '#e6eef8', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6
  }

  return (
    <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 24px' }}>

      {/* Заголовок */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#e6eef8', fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>
          Админ <span style={{ color: '#ef4444' }}>панель</span>
        </h1>
        <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Управление пользователями и контентом</p>
      </div>

      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Всего пользователей', value: users.length, color: '#3b82f6' },
          { label: 'Игроков', value: users.filter(u => u.role === 1).length, color: '#10b981' },
          { label: 'Геймастеров', value: users.filter(u => u.role === 2).length, color: '#f59e0b' },
          { label: 'Активных', value: users.filter(u => u.isActive).length, color: '#10b981' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по нику или email..."
          style={{ ...inp, maxWidth: 360 }}
        />
      </div>

      {/* Таблица пользователей */}
      {loading ? (
        <div style={{ color: '#475569' }}>Загрузка...</div>
      ) : (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Шапка таблицы */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 120px 80px 120px', gap: 16, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <div>#</div>
            <div>Пользователь</div>
            <div>Email</div>
            <div>Роль</div>
            <div>Статус</div>
            <div>Действия</div>
          </div>

          {/* Строки */}
          {filtered.map((user, i) => (
            <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 120px 80px 120px', gap: 16, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ color: '#334155', fontSize: 13 }}>{i + 1}</div>
              <div>
                <div style={{ color: '#e6eef8', fontSize: 14, fontWeight: 500 }}>{user.userName}</div>
                {(user.firstName || user.lastName) && (
                  <div style={{ color: '#475569', fontSize: 12 }}>{user.firstName} {user.lastName}</div>
                )}
              </div>
              <div style={{ color: '#475569', fontSize: 13 }}>{user.email}</div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ROLE_COLORS[user.role], background: `${ROLE_COLORS[user.role]}18`, padding: '3px 10px', borderRadius: 999 }}>
                  {ROLES[user.role]}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: user.isActive ? '#10b981' : '#ef4444' }}>
                  {user.isActive ? '● Активен' : '○ Удалён'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(user)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                    title="Редактировать">
                    ✏️
                </button>
                <button onClick={() => softDeleteUser(user.id)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#f59e0b', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                    title="Заблокировать">
                    🚫
                </button>
                <button onClick={() => hardDeleteUser(user.id)}
                    disabled={String(user.id) === currentUserId}
                    style={{ padding: '5px 10px', borderRadius: 6, border: String(user.id) === currentUserId ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: String(user.id) === currentUserId ? '#334155' : '#ef4444', fontSize: 12, cursor: String(user.id) === currentUserId ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                    title={String(user.id) === currentUserId ? 'Нельзя удалить себя' : 'Удалить навсегда'}>
                    🗑️
                </button>
                </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#334155' }}>Пользователи не найдены</div>
          )}
        </div>
      )}

      {/* Модалка редактирования */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ color: '#e6eef8', margin: 0, fontSize: 18, fontWeight: 700 }}>
              Редактировать пользователя
            </h2>

            <div>
              <label style={lbl}>Никнейм</label>
              <input style={inp} value={editForm.userName} onChange={e => setEditForm({...editForm, userName: e.target.value})} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div>
                <label style={lbl}>Роль</label>
                {String(editUser?.id) === currentUserId ? (
                    <div style={{ padding: '9px 12px', background: '#080f1a', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 14, color: '#334155' }}>
                    {ROLES[editForm.role]} — нельзя изменить свою роль
                    </div>
                ) : (
                    <select style={{...inp, cursor: 'pointer'}} value={editForm.role} onChange={e => setEditForm({...editForm, role: parseInt(e.target.value)})}>
                    <option value={0}>Guest</option>
                    <option value={1}>Player</option>
                    <option value={2}>GameMaster</option>
                    <option value={3}>Moderator</option>
                    <option value={4}>Admin</option>
                    </select>
                )}
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <select style={{...inp, cursor: 'pointer'}} value={editForm.isActive ? '1' : '0'} onChange={e => setEditForm({...editForm, isActive: e.target.value === '1'})}>
                <option value="1">Активен</option>
                <option value="0">Заблокирован</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={saveEdit}
                style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(180deg,#10b981,#059669)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Сохранить
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel