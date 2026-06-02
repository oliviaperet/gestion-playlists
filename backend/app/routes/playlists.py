from flask import Blueprint, request, jsonify
from app import db
from app.models import Playlist, PlaylistTitre, Titre
from datetime import datetime

playlists_bp = Blueprint('playlists', __name__)


@playlists_bp.route('/playlists', methods=['GET'])
def get_playlists():
    playlists = Playlist.query.all()
    return jsonify([p.to_dict() for p in playlists])


@playlists_bp.route('/playlists', methods=['POST'])
def create_playlist():
    data = request.get_json()
    if not data or not data.get('nom'):
        return jsonify({'error': 'Le champ nom est obligatoire'}), 400

    playlist = Playlist(
        nom=data['nom'].strip(),
        description=data.get('description', '').strip(),
    )
    db.session.add(playlist)
    db.session.commit()
    return jsonify(playlist.to_dict()), 201


@playlists_bp.route('/playlists/<int:id>', methods=['GET'])
def get_playlist(id):
    playlist = db.session.get(Playlist, id)
    if not playlist:
        return jsonify({'error': 'Playlist introuvable'}), 404
    return jsonify(playlist.to_dict(include_titres=True))


@playlists_bp.route('/playlists/<int:id>', methods=['DELETE'])
def delete_playlist(id):
    playlist = db.session.get(Playlist, id)
    if not playlist:
        return jsonify({'error': 'Playlist introuvable'}), 404
    db.session.delete(playlist)
    db.session.commit()
    return jsonify({'message': 'Playlist supprimée'}), 200


@playlists_bp.route('/playlists/<int:id>/titres', methods=['POST'])
def add_titre_to_playlist(id):
    playlist = db.session.get(Playlist, id)
    if not playlist:
        return jsonify({'error': 'Playlist introuvable'}), 404

    data = request.get_json()
    if not data or data.get('titre_id') is None or data.get('position') is None:
        return jsonify({'error': 'Champs obligatoires : titre_id, position'}), 400

    titre = db.session.get(Titre, data['titre_id'])
    if not titre:
        return jsonify({'error': 'Titre introuvable'}), 404

    if PlaylistTitre.query.filter_by(playlist_id=id, titre_id=data['titre_id']).first():
        return jsonify({'error': 'Ce titre est déjà dans la playlist'}), 400

    if PlaylistTitre.query.filter_by(playlist_id=id, position=data['position']).first():
        return jsonify({'error': 'Cette position est déjà prise dans la playlist'}), 400

    pt = PlaylistTitre(
        playlist_id=id,
        titre_id=data['titre_id'],
        position=int(data['position']),
    )
    db.session.add(pt)
    db.session.commit()
    return jsonify(playlist.to_dict(include_titres=True)), 201


@playlists_bp.route('/playlists/<int:id>/titres/<int:titre_id>', methods=['DELETE'])
def remove_titre_from_playlist(id, titre_id):
    pt = PlaylistTitre.query.filter_by(playlist_id=id, titre_id=titre_id).first()
    if not pt:
        return jsonify({'error': 'Ce titre ne figure pas dans la playlist'}), 404
    db.session.delete(pt)
    db.session.commit()
    return jsonify({'message': 'Titre retiré de la playlist'}), 200


@playlists_bp.route('/playlists/<int:id>/titres/<int:titre_id>/position', methods=['PATCH'])
def move_titre_in_playlist(id, titre_id):
    data = request.get_json()
    direction = data.get('direction')
    if direction not in ('up', 'down'):
        return jsonify({'error': 'Direction invalide (up ou down)'}), 400

    pt = PlaylistTitre.query.filter_by(playlist_id=id, titre_id=titre_id).first()
    if not pt:
        return jsonify({'error': 'Ce titre ne figure pas dans la playlist'}), 404

    neighbour_pos = pt.position - 1 if direction == 'up' else pt.position + 1
    neighbour = PlaylistTitre.query.filter_by(playlist_id=id, position=neighbour_pos).first()
    if not neighbour:
        return jsonify({'error': 'Impossible de déplacer dans cette direction'}), 400

    pt.position, neighbour.position = neighbour.position, pt.position
    db.session.commit()

    playlist = db.session.get(Playlist, id)
    return jsonify(playlist.to_dict(include_titres=True))


@playlists_bp.route('/playlists/<int:id>/duplicate', methods=['POST'])
def duplicate_playlist(id):
    original = db.session.get(Playlist, id)
    if not original:
        return jsonify({'error': 'Playlist introuvable'}), 404

    copie = Playlist(
        nom=f'Copie de {original.nom}',
        description=original.description,
        date_creation=datetime.utcnow(),
    )
    db.session.add(copie)
    db.session.flush()

    for pt in original.titres:
        db.session.add(PlaylistTitre(
            playlist_id=copie.id,
            titre_id=pt.titre_id,
            position=pt.position,
        ))

    db.session.commit()
    return jsonify(copie.to_dict()), 201
