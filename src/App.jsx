import { useState, useRef } from 'react'
import { SideNav, MobileNav, Hero, Marquee } from './components/Core'
import { Work, Letterbox, About, Stack, Contact } from './components/Sections'

export default function App() {
  const [active, setActive] = useState(null)
  const lastFocus = useRef(null)

  const openStudy = (project, e) => {
    lastFocus.current = e.currentTarget
    setActive(project)
  }

  const closeStudy = () => {
    setActive(null) // hard cut out — on brand
    lastFocus.current?.focus()
  }

  return (
    <>
      <a href="#work" className="skip">Skip to work</a>
      <SideNav />
      <MobileNav />
      <main className="md:pl-16 pt-16 md:pt-0">
        <Hero />
        <Marquee />
        <Work onOpen={openStudy} />
        <About />
        <Stack />
        <Contact />
      </main>
      {active && <Letterbox project={active} onClose={closeStudy} />}
    </>
  )
}