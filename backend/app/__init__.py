from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/playlists'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)

    from app.routes.artistes import artistes_bp
    from app.routes.titres import titres_bp
    from app.routes.playlists import playlists_bp

    app.register_blueprint(artistes_bp)
    app.register_blueprint(titres_bp)
    app.register_blueprint(playlists_bp)

    with app.app_context():
        from app import models  # noqa: F401 — enregistre les modèles pour create_all
        db.create_all()

    return app
