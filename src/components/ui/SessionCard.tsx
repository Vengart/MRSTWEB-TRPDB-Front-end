import React from 'react'
import styles from './SessionCard.module.css'
import Badge from './Badge'
import { Calendar, Clock, DollarSign, Users, Trash2 } from 'lucide-react'

export interface SessionCardProps {
  image?: string
  tags?: string[]
  title: string
  date?: string
  duration?: string
  price?: string
  description?: string
  players?: number
  capacity?: number
  onApply?: () => void
  id?: string
  participants?: Array<{id: string; name: string; profileUrl?: string; avatar?: string}>
  onDelete?: (id?: string) => void
  showDelete?: boolean
}

const SessionCard: React.FC<SessionCardProps> = ({
  image,
  tags = [],
  title,
  date,
  duration,
  price,
  description,
  players = 0,
  capacity = 6,
  onApply,
  id,
  participants = [],
  onDelete,
  showDelete,
}) => {
  const openDetail = () => {
    try {
      const sid = id || `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
      // store session data globally for the simple router to pick up
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__SESSIONS__ = window.__SESSIONS__ || {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__SESSIONS__[sid] = { image, tags, title, date, duration, price, description, players, capacity, participants }
      window.location.hash = `/session/${sid}`
    } catch (e) {
      console.error('openDetail error', e)
    }
  }

  return (
  <article className={styles.card} onClick={openDetail} role="button" tabIndex={0}>
    {image && <img src={image} alt="cover" className={styles.image} />}

    <div className={styles.body}>
      <div className={styles.tags}>
        {tags.map((t) => <Badge key={t}>{t}</Badge>)}
      </div>

      <h2 className={styles.title}>{title}</h2>

      {participants && participants.length > 0 && (
        <div className={styles.participants} onClick={(e) => e.stopPropagation()}>
          {participants.slice(0, 4).map(p => (
            <a key={p.id} href={`#/profile/${p.id}`} className={styles.participantLink} onClick={(e) => { e.stopPropagation(); window.location.hash = `#/profile/${p.id}` }} title={p.name}>
              {p.avatar ? <img src={p.avatar} alt={p.name} className={styles.avatar} /> : <div className={styles.avatarPlaceholder} />}
            </a>
          ))}
          {participants.length > 4 && <div className={styles.more}>+{participants.length - 4}</div>}
        </div>
      )}

      <div className={styles.meta}>
        {date && <div className={styles.metaItem}><Calendar size={14} /><span>{date}</span></div>}
        {duration && <div className={styles.metaItem}><Clock size={14} /><span>{duration}</span></div>}
        {price && <div className={styles.metaItem}><DollarSign size={14} /><span>{price}</span></div>}
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.footer}>
        <div className={styles.players}>
          <div className={styles.playersLabel}>
            <Users size={13} /> {players} из {capacity}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min((players / capacity) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {showDelete && onDelete && (
            <button
              className={styles.delete}
              onClick={(e) => { e.stopPropagation(); onDelete(id) }}
              aria-label="Удалить сессию"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            className={styles.apply}
            onClick={(e) => { e.stopPropagation(); onApply && onApply() }}
          >
            Подать заявку
          </button>
        </div>
      </div>
    </div>
  </article>
)
}

export default SessionCard
