import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Artistes from './pages/Artistes'
import Titres from './pages/Titres'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-brand">
          Playlist Manager
        </div>
        <NavLink to="/artistes" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Artistes
        </NavLink>
        <NavLink to="/titres" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Titres
        </NavLink>
        <NavLink to="/playlists" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Playlists
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Artistes />} />
        <Route path="/artistes" element={<Artistes />} />
        <Route path="/titres" element={<Titres />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
