from flask import Blueprint, request, jsonify
from app import db
from app.models import Artiste, Titre

artistes_bp = Blueprint('artistes', __name__)


@artistes_bp.route('/artistes', methods=['GET'])
def get_artistes():
    artistes = Artiste.query.all()
    result = []
    for a in artistes:
        d = a.to_dict()
        d['titres'] = [t.to_dict() for t in a.titres]
        result.append(d)
    return jsonify(result)


@artistes_bp.route('/artistes', methods=['POST'])
def create_artiste():
    data = request.get_json()
    if not data or not data.get('nom') or not data.get('genre_musical') or not data.get('pays'):
        return jsonify({'error': 'Champs obligatoires manquants : nom, genre_musical, pays'}), 400

    nom = data['nom'].strip()
    if Artiste.query.filter_by(nom=nom).first():
        return jsonify({'error': f'L\'artiste "{nom}" existe déjà'}), 409

    artiste = Artiste(
        nom=nom,
        genre_musical=data['genre_musical'].strip(),
        pays=data['pays'].strip(),
    )
    db.session.add(artiste)
    db.session.commit()
    return jsonify(artiste.to_dict()), 201


@artistes_bp.route('/artistes/<int:artiste_id>', methods=['DELETE'])
def delete_artiste(artiste_id):
    artiste = Artiste.query.get_or_404(artiste_id)
    if artiste.titres:
        return jsonify({'error': 'Impossible de supprimer un artiste qui a des titres'}), 409
    db.session.delete(artiste)
    db.session.commit()
    return '', 204
