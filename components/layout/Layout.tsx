import React from 'react'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />

      <button className={styles.fab} aria-label="add">+
      </button>
    </div>
  )
}

export default Layout
