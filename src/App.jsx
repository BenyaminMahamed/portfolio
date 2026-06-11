import { Nav, Hero, About } from './components/Core'
import { Work, Arsenal, Archive, Contact } from './components/Sections'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="slash-divider" aria-hidden="true" />
        <About />
        <Work />
        <Arsenal />
        <div className="slash-divider" aria-hidden="true" />
        <Archive />
        <Contact />
      </main>
    </>
  )
}