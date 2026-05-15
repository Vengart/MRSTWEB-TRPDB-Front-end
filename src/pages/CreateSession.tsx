import React, { useState } from 'react'
import { Plus, X, Gamepad2, Monitor, Calendar, Clock, DollarSign, Users, Image } from 'lucide-react'

type CreateSessionProps = {
  isGamemaster: boolean
  onCreate: (form: any) => void
  onCancel: () => void
}

const input: React.CSSProperties = {
  background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
  color: '#e6eef8', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
}
const label: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '6px',
}
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const focusGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'
const blurGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'

const CreateSession: React.FC<CreateSessionProps> = ({ isGamemaster, onCreate, onCancel }) => {
  const [form, setForm] = useState({
    title: '', description: '', game: '', format: '',
    date: '', duration: '', price: '', capacity: 6, image: ''
  })

  if (!isGamemaster) return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <X size={24} color="#ef4444" />
      </div>
      <h2 style={{ color: '#e6eef8', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Доступ ограничен</h2>
      <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
        Создавать сессии могут только пользователи с ролью Гейммастер.
      </p>
      <a href="#/account" style={{ display: 'inline-block', padding: '9px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '999px', color: '#10b981', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
        Перейти в аккаунт
      </a>
    </div>
  )

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#e6eef8', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Новая <span style={{ color: '#10b981' }}>сессия</span>
        </h2>
        <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Заполни детали — и собирай команду</p>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={field}>
          <label style={label}>Название</label>
          <input style={input} type="text" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onFocus={focusGreen} onBlur={blurGreen} placeholder="Рейд: Хранители Песков" />
        </div>

        <div style={field}>
          <label style={label}>Описание</label>
          <textarea style={{ ...input, resize: 'none', lineHeight: '1.6' }} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            onFocus={focusGreen} onBlur={blurGreen} rows={4}
            placeholder="Расскажи про механику, уровни, ожидания..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={field}>
            <label style={label}><Gamepad2 size={11} style={{ display: 'inline', marginRight: '4px' }} />Игра</label>
            <select style={{ ...input, cursor: 'pointer' }} value={form.game}
              onChange={e => setForm({ ...form, game: e.target.value })}
              onFocus={focusGreen} onBlur={blurGreen}>
              <option value="">Выберите игру</option>
              <option value="D&D5e">D&D5e</option>
              <option value="Pf2e">Pf2e</option>
              <option value="VtM5e">VtM5e</option>
              <option value="Call Of Cthulhu 7e">Call Of Cthulhu 7e</option>
            </select>
          </div>
          <div style={field}>
            <label style={label}><Monitor size={11} style={{ display: 'inline', marginRight: '4px' }} />Формат</label>
            <select style={{ ...input, cursor: 'pointer' }} value={form.format}
              onChange={e => setForm({ ...form, format: e.target.value })}
              onFocus={focusGreen} onBlur={blurGreen}>
              <option value="">Выберите формат</option>
              <option value="Онлайн">Онлайн</option>
              <option value="Оффлайн">Оффлайн</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={field}>
            <label style={label}><Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} />Дата</label>
            <input style={input} type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              onFocus={focusGreen} onBlur={blurGreen} />
          </div>
          <div style={field}>
            <label style={label}><Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />Длительность</label>
            <input style={input} type="text" value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              onFocus={focusGreen} onBlur={blurGreen} placeholder="4 ч" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={field}>
            <label style={label}><DollarSign size={11} style={{ display: 'inline', marginRight: '4px' }} />Цена</label>
            <input style={input} type="text" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              onFocus={focusGreen} onBlur={blurGreen} placeholder="Бесплатно" />
          </div>
          <div style={field}>
            <label style={label}><Users size={11} style={{ display: 'inline', marginRight: '4px' }} />Мест</label>
            <input style={input} type="number" value={form.capacity} min="1"
              onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 6 })}
              onFocus={focusGreen} onBlur={blurGreen} />
          </div>
        </div>

        <div style={field}>
          <label style={label}><Image size={11} style={{ display: 'inline', marginRight: '4px' }} />URL обложки</label>
          <input style={input} type="text" value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
            onFocus={focusGreen} onBlur={blurGreen} placeholder="https://..." />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }} />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onCreate(form)} disabled={!form.title || !form.game}
            style={{ flex: 2, padding: '11px 16px', borderRadius: '8px', border: 'none', background: (!form.title || !form.game) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg,#10b981,#059669)', color: (!form.title || !form.game) ? '#334155' : 'white', fontSize: '14px', fontWeight: 600, cursor: (!form.title || !form.game) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}>
            <Plus size={16} /> Создать сессию
          </button>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#475569', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e6eef8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSession