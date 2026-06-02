from flask import Blueprint, request, jsonify
from app import db
from app.models import Titre, Artiste

titres_bp = Blueprint('titres', __name__)


@titres_bp.route('/titres', methods=['GET'])
def get_titres():
    titres = Titre.query.all()
    return jsonify([t.to_dict() for t in titres])


@titres_bp.route('/titres', methods=['POST'])
def create_titre():
    data = request.get_json()
    required = ['nom', 'artiste_id', 'duree_secondes', 'annee']
    if not data or not all(data.get(f) is not None for f in required):
        return jsonify({'error': f'Champs obligatoires : {", ".join(required)}'}), 400

    artiste = db.session.get(Artiste, data['artiste_id'])
    if not artiste:
        return jsonify({'error': 'Artiste introuvable'}), 404

    nom = data['nom'].strip()
    if Titre.query.filter_by(nom=nom, artiste_id=data['artiste_id']).first():
        return jsonify({'error': f'Ce titre existe déjà pour cet artiste'}), 409

    titre = Titre(
        nom=nom,
        artiste_id=data['artiste_id'],
        duree_secondes=int(data['duree_secondes']),
        annee=int(data['annee']),
    )
    db.session.add(titre)
    db.session.commit()
    return jsonify(titre.to_dict()), 201


@titres_bp.route('/titres/<int:id>', methods=['DELETE'])
def delete_titre(id):
    titre = db.session.get(Titre, id)
    if not titre:
        return jsonify({'error': 'Titre introuvable'}), 404
    db.session.delete(titre)
    db.session.commit()
    return jsonify({'message': 'Titre supprimé'}), 200
