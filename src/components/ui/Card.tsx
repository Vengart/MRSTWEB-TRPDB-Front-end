import React from 'react'
import styles from './Card.module.css'

export interface CardProps {
  title: string
  description?: string
  date?: string
  href?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ title, description, date, href, onClick }) => {
  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.footer}>
        {date && <time className={styles.date}>{date}</time>}
        {href && (
          <a className={styles.link} href={href} onClick={(e) => e.stopPropagation()}>
            Подробнее
          </a>
        )}
      </div>
    </article>
  )
}

export default Card
