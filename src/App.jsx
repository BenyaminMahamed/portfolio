import { Nav, Hero, Input, HudChrome } from './components/Core'
import { Detections, Weights, Buffer, Transmit } from './components/Sections'

export default function App() {
  return (
    <>
      <HudChrome />
      <Nav />
      <main>
        <Hero />
        <Input />
        <Detections />
        <Weights />
        <Buffer />
        <Transmit />
      </main>
    </>
  )
}