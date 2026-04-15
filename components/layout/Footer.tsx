import React from 'react'
import styles from './Footer.module.css'

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span>Какой то текст для первого концепта</span>
      </div>
    </footer>
  )
}

export default Footer
