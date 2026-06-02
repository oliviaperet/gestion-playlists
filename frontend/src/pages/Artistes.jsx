import { useState, useEffect } from 'react'
import api from '../api'
import { fmt } from '../utils'

export default function Artistes() {
  const [artistes, setArtistes] = useState([])
  const [form, setForm] = useState({ nom: '', genre_musical: '', pays: '' })
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const r = await api.get('/artistes')
      setArtistes(r.data)
    } catch {
      setError('Erreur de connexion')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/artistes', form)
      setForm({ nom: '', genre_musical: '', pays: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet artiste ?')) return
    try {
      await api.delete(`/artistes/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  function toggleArtiste(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const totalTitres = artistes.reduce((total, a) => total + a.titres.length, 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Artistes</h1>
        <p>Tous tes artistes préférés au même endroit</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Artistes</div>
          <div className="stat-value">{String(artistes.length).padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Titres au total</div>
          <div className="stat-value">{String(totalTitres).padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ambiance</div>
          <div className="stat-value" style={{ fontSize: '1rem', paddingTop: '0.4rem' }}>
            immaculate
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ajouter un artiste</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input type="text" placeholder="Nom de l'artiste..." value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input type="text" placeholder="Pop, r&b, rap..." value={form.genre_musical}
                onChange={e => setForm(f => ({ ...f, genre_musical: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Pays</label>
              <input type="text" placeholder="Pays d'origine" value={form.pays}
                onChange={e => setForm(f => ({ ...f, pays: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {artistes.length === 0
        ? <div className="empty" />
        : artistes.map((a, i) => (
          <div key={a.id} className="artiste-card">
            <div className="artiste-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="artiste-name">{a.nom}</span>
                </div>
                <div className="artiste-meta">{a.genre_musical} · {a.pays}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-dim">{a.titres.length} titres</span>
                {a.titres.length === 0 && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>
                    Supprimer
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => toggleArtiste(a.id)}>
                  {expanded[a.id] ? '▲ Fermer' : '▼ Titres'}
                </button>
              </div>
            </div>

            {expanded[a.id] && (
              <div className="artiste-titres">
                {a.titres.length === 0
                  ? <div className="empty" />
                  : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Titre</th>
                            <th>Durée</th>
                            <th>Année</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.titres.map((t, j) => (
                            <tr key={t.id}>
                              <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', width: 48, textAlign: 'center' }}>
                                {String(j + 1).padStart(2, '0')}
                              </td>
                              <td style={{ fontWeight: 600 }}>{t.nom}</td>
                              <td><span className="badge badge-pink">{fmt(t.duree_secondes)}</span></td>
                              <td style={{ color: 'var(--muted)' }}>{t.annee}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
