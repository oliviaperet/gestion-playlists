import { useState, useEffect } from 'react'
import api from '../api'
import { fmt } from '../utils'

export default function Titres() {
  const [titres, setTitres] = useState([])
  const [artistes, setArtistes] = useState([])
  const [form, setForm] = useState({ nom: '', artiste_id: '', duree_secondes: '', annee: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [filtreArtiste, setFiltreArtiste] = useState('')
  const [filtreAnnee, setFiltreAnnee] = useState('')

  useEffect(() => {
    loadTitres()
    loadArtistes()
  }, [])

  async function loadTitres() {
    try {
      const r = await api.get('/titres')
      setTitres(r.data)
    } catch {
      setError('Erreur de connexion')
    }
  }

  async function loadArtistes() {
    try {
      const r = await api.get('/artistes')
      setArtistes(r.data)
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/titres', {
        nom: form.nom,
        artiste_id: parseInt(form.artiste_id),
        duree_secondes: parseInt(form.duree_secondes),
        annee: parseInt(form.annee),
      })
      setForm({ nom: '', artiste_id: '', duree_secondes: '', annee: '' })
      loadTitres()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce titre ?')) return
    try {
      await api.delete(`/titres/${id}`)
      loadTitres()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  function filtrerTitres() {
    return titres.filter(t => {
      const texte = recherche.toLowerCase()
      const correspondTexte = !texte || t.nom.toLowerCase().includes(texte) || t.artiste_nom.toLowerCase().includes(texte)
      const correspondArtiste = !filtreArtiste || String(t.artiste_id) === filtreArtiste
      const correspondAnnee = !filtreAnnee || String(t.annee) === filtreAnnee
      return correspondTexte && correspondArtiste && correspondAnnee
    })
  }

  function reinitialiserFiltres() {
    setRecherche('')
    setFiltreArtiste('')
    setFiltreAnnee('')
  }

  const annees = [...new Set(titres.map(t => t.annee))].sort((a, b) => b - a)
  const titresFiltres = filtrerTitres()
  const dureeTotal = titres.reduce((s, t) => s + t.duree_secondes, 0)
  const totalMin = Math.floor(dureeTotal / 60)
  const filtresActifs = recherche || filtreArtiste || filtreAnnee

  return (
    <div className="page">
      <div className="page-header">
        <h1>Titres</h1>
        <p>Tous les sons, toutes les ères — {titres.length} titres · {totalMin} min</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Titres</div>
          <div className="stat-value">{String(titres.length).padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Durée totale</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '0.35rem' }}>{totalMin} min</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ajouter un titre</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Titre</label>
              <input type="text" placeholder="Nom du titre..." value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Artiste</label>
              <select value={form.artiste_id}
                onChange={e => setForm(f => ({ ...f, artiste_id: e.target.value }))} required>
                <option value="">Choisir un artiste</option>
                {artistes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Durée (s)</label>
              <input type="number" placeholder="248" value={form.duree_secondes}
                onChange={e => setForm(f => ({ ...f, duree_secondes: e.target.value }))} min="1" required />
            </div>
            <div className="form-group">
              <label className="form-label">Année</label>
              <input type="number" placeholder="2003" value={form.annee}
                onChange={e => setForm(f => ({ ...f, annee: e.target.value }))} min="1900" max="2100" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Ajouter'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Recherche et filtres</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Rechercher</label>
            <input type="text" placeholder="Titre ou artiste..." value={recherche}
              onChange={e => setRecherche(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Artiste</label>
            <select value={filtreArtiste} onChange={e => setFiltreArtiste(e.target.value)}>
              <option value="">Tous</option>
              {artistes.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Année</label>
            <select value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)}>
              <option value="">Toutes</option>
              {annees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {filtresActifs && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={reinitialiserFiltres}>
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>#</th>
                <th>Titre</th>
                <th>Artiste</th>
                <th>Durée</th>
                <th>Année</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {titresFiltres.length === 0
                ? <tr><td colSpan={6}><div className="empty" /></td></tr>
                : titresFiltres.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', textAlign: 'center' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.nom}</td>
                    <td style={{ color: 'var(--muted)' }}>{t.artiste_nom}</td>
                    <td><span className="badge badge-pink">{fmt(t.duree_secondes)}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{t.annee}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
