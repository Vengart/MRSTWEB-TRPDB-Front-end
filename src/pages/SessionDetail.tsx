import React from 'react'

const SessionDetail: React.FC<{ id: string }> = ({ id }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const session = (typeof window !== 'undefined' && window.__SESSIONS__ && window.__SESSIONS__[id]) || null

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Сессия не найдена</h2>
        <p>Данные сессии отсутствуют или срок хранения истёк.</p>
        <p><a href="#/">Вернуться на главную</a></p>
      </div>
    )
  }

  const { image, title, tags = [], date, duration, price, description, players, capacity, participants = [] } = session

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {image && <img src={image} alt="cover" style={{ width: 320, height: 220, objectFit: 'cover', borderRadius: 12 }} />}
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <div style={{ color: '#64748b', marginTop: 8 }}>{tags.join(' • ')}</div>
          <div style={{ marginTop: 12, color: '#475569' }}>{date} · {duration} · {price}</div>
        </div>
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>Описание</h3>
        <p style={{ color: '#334155' }}>{description}</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Участники ({players} / {capacity})</h3>
        {participants.length === 0 ? (
          <p style={{ color: '#64748b' }}>Пока никто не записан. Будьте первым!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {participants.map((p: any) => (
              <li key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                {p.avatar ? <img src={p.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: 999 }} /> : <div style={{ width: 40, height: 40, borderRadius: 999, background: '#e2e8f0' }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <a href={`#/profile/${p.id}`}>Просмотреть профиль</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p style={{ marginTop: 24 }}><a href="#/">← Вернуться</a></p>
    </div>
  )
}

export default SessionDetail
