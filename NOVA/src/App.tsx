import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticlesBackground from './components/ParticlesBackground'
import Home from './pages/Home'
import AdminPanel from './admin/AdminPanel'
import Register from './pages/Register'
import Sprints from './pages/Sprints'
import IdeasprintPage from './pages/IdeasprintPage'
import TeamFinderPage from './pages/TeamFinderPage'
import ShowcasePage from './pages/ShowcasePage'

const Rules: React.FC = (): React.JSX.Element => <div>Rules Page</div>

// Helper component to access location and conditionally render particles
const AppContent: React.FC = (): React.JSX.Element => {
  const location = useLocation()
  const isIdeaSprint = location.pathname === '/ideasprint'

  return (
    <div className="App">
      <Navbar />
      
      {/* Conditionally hide global particles on IdeaSprint page */}
      {!isIdeaSprint && <ParticlesBackground />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/ideasprint" element={<IdeasprintPage />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find-squad" element={<TeamFinderPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
