import React from 'react'
import styles from './SessionCard.module.css'
import Badge from './Badge'
import { Calendar, Clock, DollarSign, Users } from 'lucide-react'

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
      {image && (
        <img src={image} alt="cover" className={styles.image} />
      )}

      <div className={styles.tags}>
        {tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <h2 className={styles.title}>{title}</h2>

      <div className={styles.meta}>
        {date && (
          <div className={styles.metaItem}><Calendar size={16} /> <span>{date}</span></div>
        )}
        {duration && (
          <div className={styles.metaItem}><Clock size={16} /> <span>{duration}</span></div>
        )}
        {price && (
          <div className={styles.metaItem}><DollarSign size={16} /> <span>{price}</span></div>
        )}
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.footer}>
        <div className={styles.players}><Users size={16} /> {players} из {capacity}</div>
        <button className={styles.apply} onClick={(e) => { e.stopPropagation(); onApply && onApply() }}>Подать заявку</button>
      </div>
    </article>
  )
}

export default SessionCard
