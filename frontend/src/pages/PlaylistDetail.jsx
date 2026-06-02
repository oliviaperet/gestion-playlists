import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { fmt, fmtDuree } from '../utils'

export default function PlaylistDetail() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [allTitres, setAllTitres] = useState([])
  const [form, setForm] = useState({ titre_id: '', position: '' })
  const [error, setError] = useState('')

  useEffect(() => { loadPlaylist(); loadTitres() }, [id])

  async function loadPlaylist() {
    try { const r = await api.get(`/playlists/${id}`); setPlaylist(r.data) }
    catch { setError('Playlist introuvable') }
  }
  async function loadTitres() {
    try { const r = await api.get('/titres'); setAllTitres(r.data) } catch {}
  }

  async function handleAdd(e) {
    e.preventDefault(); setError('')
    try {
      const r = await api.post(`/playlists/${id}/titres`, {
        titre_id: parseInt(form.titre_id),
        position: parseInt(form.position),
      })
      setPlaylist(r.data)
      setForm({ titre_id: '', position: '' })
    } catch (err) { setError(err.response?.data?.error || 'Erreur') }
  }

  async function handleRemove(titreId) {
    if (!confirm('Retirer ce titre de la playlist ?')) return
    try { await api.delete(`/playlists/${id}/titres/${titreId}`); loadPlaylist() }
    catch (err) { setError(err.response?.data?.error || 'Erreur') }
  }

  async function handleMove(titreId, direction) {
    try {
      const r = await api.patch(`/playlists/${id}/titres/${titreId}/position`, { direction })
      setPlaylist(r.data)
    } catch (err) { setError(err.response?.data?.error || 'Erreur') }
  }

  if (!playlist) return (
    <div className="page">
      <Link to="/playlists" className="back-link">← Retour aux playlists</Link>
      <div className="alert alert-error">{error || 'Chargement...'}</div>
    </div>
  )

  const dejaPresents = new Set(playlist.titres.map(t => t.titre_id))
  const disponibles = allTitres.filter(t => !dejaPresents.has(t.id))
  const nextPos = playlist.titres.length + 1
  const maxPos = playlist.titres.length

  return (
    <div className="page">
      <Link to="/playlists" className="back-link">← Retour aux playlists</Link>

      <div className="page-header">
        <h1>{playlist.nom}</h1>
        {playlist.description && <p>{playlist.description}</p>}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Titres</div>
          <div className="stat-value">{String(playlist.nb_titres).padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Durée totale</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '0.35rem' }}>
            {fmtDuree(playlist.duree_totale)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Créée le</div>
          <div className="stat-value" style={{ fontSize: '0.85rem', paddingTop: '0.5rem', fontFamily: 'var(--mono)' }}>
            {new Date(playlist.date_creation).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="now-playing-bar">
          <div className="now-playing-label">
            <span className="dot-pulse" />
            En écoute
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-lilac">{playlist.nb_titres} titres</span>
            <span className="badge badge-pink">{fmtDuree(playlist.duree_totale)}</span>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 52, textAlign: 'center' }}>#</th>
                <th>Titre</th>
                <th>Artiste</th>
                <th>Durée</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {playlist.titres.length === 0
                ? <tr><td colSpan={5}><div className="empty" /></td></tr>
                : playlist.titres.map(t => (
                  <tr key={t.titre_id}>
                    <td style={{ textAlign: 'center' }}><span className="pos-num">{t.position}</span></td>
                    <td style={{ fontWeight: 600 }}>{t.nom}</td>
                    <td style={{ color: 'var(--muted)' }}>{t.artiste}</td>
                    <td><span className="badge badge-pink">{fmt(t.duree_secondes)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => handleMove(t.titre_id, 'up')}
                          disabled={t.position === 1}
                          style={{ padding: '0.3rem 0.6rem' }}>▲</button>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => handleMove(t.titre_id, 'down')}
                          disabled={t.position === maxPos}
                          style={{ padding: '0.3rem 0.6rem' }}>▼</button>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleRemove(t.titre_id)}>
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-title">Ajouter un titre</div>
        {disponibles.length === 0
          ? <p style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
              Tous les titres sont déjà là
            </p>
          : (
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 3 }}>
                  <label className="form-label">Titre</label>
                  <select value={form.titre_id}
                    onChange={e => setForm(f => ({ ...f, titre_id: e.target.value }))} required>
                    <option value="">Choisir un titre</option>
                    {disponibles.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nom} — {t.artiste_nom} [{fmt(t.duree_secondes)}]
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input type="number" placeholder={nextPos} value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))} min="1" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Ajouter à la playlist</button>
            </form>
          )}
      </div>
    </div>
  )
}
