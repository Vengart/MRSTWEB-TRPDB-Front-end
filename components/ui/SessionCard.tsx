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
}) => {
  return (
    <article className={styles.card}>
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
        <button className={styles.apply} onClick={onApply}>Подать заявку</button>
      </div>
    </article>
  )
}

export default SessionCard
