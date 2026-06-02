import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { fmtDuree } from '../utils'

export default function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [form, setForm] = useState({ nom: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const r = await api.get('/playlists')
      setPlaylists(r.data)
    } catch {
      setError('Erreur de connexion')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/playlists', form)
      setForm({ nom: '', description: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette playlist ?')) return
    try {
      await api.delete(`/playlists/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  async function handleDuplique(id) {
    try {
      await api.post(`/playlists/${id}/duplicate`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  const dureeTotal = playlists.reduce((total, p) => total + p.duree_totale, 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Playlists</h1>
        <p>Compose ton univers, titre par titre</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Playlists</div>
          <div className="stat-value">{String(playlists.length).padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Durée cumulée</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '0.35rem' }}>
            {fmtDuree(dureeTotal)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Créer une playlist</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input type="text" placeholder="Ma playlist principale..." value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description / ambiance</label>
            <textarea placeholder="Décris l'ambiance..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Créer'}
          </button>
        </form>
      </div>

      {playlists.length === 0
        ? <div className="empty" />
        : playlists.map((p, i) => (
          <div key={p.id} className="playlist-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Link to={`/playlists/${p.id}`} className="playlist-card-title">{p.nom}</Link>
              </div>
              {p.description && <div className="playlist-meta">{p.description}</div>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge badge-lilac">{p.nb_titres} titres</span>
                <span className="badge badge-pink">{fmtDuree(p.duree_totale)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Link to={`/playlists/${p.id}`} className="btn btn-lilac btn-sm">Ouvrir</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDuplique(p.id)}>Dupliquer</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Supprimer</button>
            </div>
          </div>
        ))}
    </div>
  )
}
