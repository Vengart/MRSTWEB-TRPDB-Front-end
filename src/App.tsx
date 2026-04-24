import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout'
import { SessionCard } from '../components/ui'
import SessionDetail from './pages/SessionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Profile from './pages/Profile'

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // simple hash router: #/session/:id or #/login or #/register or #/
  if (route === '#/login') {
    return <Layout><Login /></Layout>
  }

  if (route === '#/register') {
    return <Layout><Register /></Layout>
  }

  if (route === '#/account') {
    return <Layout><Account /></Layout>
  }

  if (route.startsWith('#/profile/')) {
    const id = route.replace('#/profile/', '')
    return <Layout><Profile id={id} /></Layout>
  }

  if (route.startsWith('#/session/')) {
    const id = route.replace('#/session/', '')
    return <Layout><SessionDetail id={id} /></Layout>
  }

  return (
    <Layout>
      <h1>Главная страница</h1>
      <section className="grid">
        <SessionCard
          id="raid-keepers"
          image="https://i.redd.it/2k34ydhyvkp31.jpg"
          tags={["Онлайн", "D&D5e"]}
          title="Рейд: Хранители Песков"
          date="15 апр 2026"
          duration="10 ч"
          price="Бесплатно"
          description="Короткое описание сессии — механика, уровни и ожидания от участников. Подготовьтесь к эпическим боссам и командной работе."
          players={2}
          capacity={6}
            participants={[{id:'vengart',name:'vengart',profileUrl:'#/profile/vengart',avatar:'https://www.gaydamak.com.ua/image/cache/catalog/image/catalog/products/Patchi--Shevrony--Nashivki/Nashivka-patch-shevron-Pepe-s-sizhkoj.webp'},{id:'admin',name:'aR2Om',profileUrl:'#/profile/admin',avatar:'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg'}]}
        />

        <SessionCard
          id="last-training"
          image="https://thedmlair.com/cdn/shop/articles/perfect-dungeon.jpg?v=1705769581"
          tags={["Оффлайн", "Pf2e"]}
          title="Последняя тренировка"
          date="20 апр 2026"
          duration="5 ч"
          price="200 шмерплов"
          description="Маленькое приключение, которое позволяет больше разобрться в pathfinder 2e"
          players={1}
          capacity={6}
            participants={[{id:'admin',name:'aR2Om',profileUrl:'#/profile/admin',avatar:'https://cs13.pikabu.ru/post_img/2023/06/12/5/1686554492121677.jpg'}]}
        />
      </section>
    </Layout>
  )
}

export default App
