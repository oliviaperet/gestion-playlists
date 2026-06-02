from app import db
from datetime import datetime


class Artiste(db.Model):
    __tablename__ = 'artistes'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False, unique=True)
    genre_musical = db.Column(db.String(100), nullable=False)
    pays = db.Column(db.String(100), nullable=False)

    titres = db.relationship('Titre', backref='artiste', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'genre_musical': self.genre_musical,
            'pays': self.pays,
        }


class Titre(db.Model):
    __tablename__ = 'titres'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(200), nullable=False)
    artiste_id = db.Column(db.Integer, db.ForeignKey('artistes.id'), nullable=False)
    duree_secondes = db.Column(db.Integer, nullable=False)
    annee = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'artiste_id': self.artiste_id,
            'artiste_nom': self.artiste.nom if self.artiste else None,
            'duree_secondes': self.duree_secondes,
            'annee': self.annee,
        }


class PlaylistTitre(db.Model):
    __tablename__ = 'playlist_titres'

    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.id'), primary_key=True)
    titre_id = db.Column(db.Integer, db.ForeignKey('titres.id'), primary_key=True)
    position = db.Column(db.Integer, nullable=False)

    titre = db.relationship('Titre')

    def to_dict(self):
        return {
            'position': self.position,
            'titre_id': self.titre_id,
            'nom': self.titre.nom,
            'artiste': self.titre.artiste.nom if self.titre.artiste else None,
            'duree_secondes': self.titre.duree_secondes,
            'annee': self.titre.annee,
        }


class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    titres = db.relationship(
        'PlaylistTitre',
        backref='playlist',
        lazy=True,
        cascade='all, delete-orphan',
    )

    def to_dict(self, include_titres=False):
        data = {
            'id': self.id,
            'nom': self.nom,
            'description': self.description,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'nb_titres': len(self.titres),
            'duree_totale': sum(pt.titre.duree_secondes for pt in self.titres),
        }
        if include_titres:
            titres_tries = sorted(self.titres, key=lambda pt: pt.position)
            data['titres'] = [pt.to_dict() for pt in titres_tries]
        return data
