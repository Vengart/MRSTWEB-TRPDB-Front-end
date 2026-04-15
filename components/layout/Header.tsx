import React from 'react'
import styles from './Header.module.css'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.left}>
            <div className={styles.logo}>FreakyAhhh</div>
          </div>

          <div className={styles.center}>
            <select className={styles.select} aria-label="Фильтр: игра">
              <option>Все игры</option>
              <option>D&D5e</option>
              <option>Pf2e</option>
              <option>VtM5e</option>
              <option>Call Of Cthulhu 7e</option>
              <option>D&D4e</option>
              <option>PfRPG</option>
            </select>
            <select className={styles.select} aria-label="Фильтр: формат">
              <option>Все форматы</option>
              <option>Онлайн</option>
              <option>Оффлайн</option>
            </select>
            <select className={styles.select} aria-label="Фильтр: доступность">
              <option>Все</option>
              <option>Свободные</option>
              <option>Полные</option>
            </select>
          </div>

          <div className={styles.right}>
            <button className={styles.login}>Войти</button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
