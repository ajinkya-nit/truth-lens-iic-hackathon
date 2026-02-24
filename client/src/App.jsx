import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'
import Detail from './pages/Detail'

function App() {
  return (
    <div className="app-wrapper">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<Detail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
