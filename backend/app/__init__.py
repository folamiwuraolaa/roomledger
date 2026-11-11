import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import db
from .routes import api

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-only-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///roommate_ledger.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "None" if os.getenv("COOKIE_SECURE", "false").lower() == "true" else "Lax"
    app.config["SESSION_COOKIE_SECURE"] = os.getenv("COOKIE_SECURE", "false").lower() == "true"

    db.init_app(app)

    origins = [x.strip() for x in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if x.strip()]
    CORS(app, supports_credentials=True, origins=origins)

    app.register_blueprint(api, url_prefix="/api")

    with app.app_context():
        from . import models  # noqa: F401
        db.create_all()

    return app
