import React from 'react'
import styles from './Footer.module.css'

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span>Приятной игры!</span>
      </div>
    </footer>
  )
}

export default Footer
