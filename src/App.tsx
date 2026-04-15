import React from 'react'
import { Layout } from '../components/layout'
import { SessionCard } from '../components/ui'

const App: React.FC = () => {
  return (
    <Layout>
      <h1>Демо — главная страница</h1>
      <section className="grid">
        <SessionCard
          image="https://i.redd.it/2k34ydhyvkp31.jpg"
          tags={["Онлайн", "D&D5e"]}
          title="Рейд: Хранители Песков"
          date="15 апр 2026"
          duration="10 ч"
          price="Бесплатно"
          description="Короткое описание сессии — механика, уровни и ожидания от участников. Подготовьтесь к эпическим боссам и командной работе."
          players={2}
          capacity={6}
        />

        <SessionCard
          image="https://thedmlair.com/cdn/shop/articles/perfect-dungeon.jpg?v=1705769581"
          tags={["Оффлайн", "Pf2e"]}
          title="Последняя тренировка"
          date="20 апр 2026"
          duration="5 ч"
          price="200 шмерплов"
          description="Маленькое приключение, которое позволяет больше разобрться в pathfinder 2e"
          players={1}
          capacity={6}
        />
      </section>
    </Layout>
  )
}

export default App
